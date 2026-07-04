import { Prisma, prisma } from "@mazidi/db";
import type { AIAssistant } from "@mazidi/db";
import type { TeamContext } from "./team";

/**
 * AI layer (Module 4, docs/04 §5) — real OpenAI integration, no canned replies.
 * Conversations persist in AIConversation; each assistant is grounded in the
 * caller's actual database context (their projects, invoices, pipeline).
 * Missing OPENAI_API_KEY → AIError 503, surfaced honestly to the UI.
 */

export class AIError extends Error {
  constructor(message: string, public status = 502) { super(message); }
}

type ChatMessage = { role: "user" | "assistant"; content: string; at?: string };

const MAX_TURNS = 12;
const MAX_STORED = 40;

async function completeChat(system: string, history: ChatMessage[]): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new AIError("AI is not configured yet (OPENAI_API_KEY missing)", 503);
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 600,
      messages: [
        { role: "system", content: system },
        ...history.slice(-MAX_TURNS).map(({ role, content }) => ({ role, content })),
      ],
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new AIError(`OpenAI request failed (${res.status}): ${detail.slice(0, 200)}`);
  }
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!reply) throw new AIError("OpenAI returned an empty response");
  return reply;
}

async function loadConversation(userId: string, assistant: AIAssistant, companyId?: string | null) {
  const latest = await prisma.aIConversation.findFirst({
    where: { userId, assistant },
    orderBy: { createdAt: "desc" },
  });
  const messages = (latest?.messages ?? []) as ChatMessage[];
  if (latest && messages.length < MAX_STORED) return { id: latest.id, messages };
  const created = await prisma.aIConversation.create({
    data: { userId, assistant, companyId: companyId ?? null, messages: [] },
  });
  return { id: created.id, messages: [] as ChatMessage[] };
}

async function chat(
  userId: string, assistant: AIAssistant, system: string, message: string, companyId?: string | null,
) {
  const conv = await loadConversation(userId, assistant, companyId);
  const history: ChatMessage[] = [...conv.messages, { role: "user", content: message, at: new Date().toISOString() }];
  const reply = await completeChat(system, history);
  const updated: ChatMessage[] = [...history, { role: "assistant", content: reply, at: new Date().toISOString() }];
  await prisma.aIConversation.update({
    where: { id: conv.id },
    data: { messages: updated as unknown as Prisma.InputJsonValue },
  });
  return updated;
}

export async function getConversation(userId: string, assistant: AIAssistant) {
  const conv = await prisma.aIConversation.findFirst({
    where: { userId, assistant }, orderBy: { createdAt: "desc" },
  });
  return ((conv?.messages ?? []) as ChatMessage[]);
}

// ── Portal: Business Advisor (grounded in the customer's account) ──

export async function advisorChat(userId: string, customerId: string, message: string) {
  const [projects, invoices, subs, recommendations] = await Promise.all([
    prisma.project.findMany({
      where: { customerId, status: { in: ["PLANNED", "ACTIVE"] } },
      select: { name: true, progress: true, dueAt: true, company: { select: { name: true } } },
    }),
    prisma.invoice.findMany({
      where: { customerId, status: { in: ["SENT", "DUE", "OVERDUE"] } },
      select: { number: true, amount: true, tax: true, dueAt: true, company: { select: { name: true } } },
    }),
    prisma.subscription.findMany({ where: { customerId, status: { not: "canceled" } }, select: { serviceId: true, renewsAt: true } }),
    prisma.company.findMany({
      where: { status: "LIVE", customers: { none: { customerId } } },
      select: { name: true, description: true }, take: 3,
    }),
  ]);

  const context = [
    "ACCOUNT CONTEXT (live database):",
    `Active projects: ${projects.map((p) => `${p.name} (${p.company.name}, ${p.progress}%${p.dueAt ? `, due ${p.dueAt.toISOString().slice(0, 10)}` : ""})`).join("; ") || "none"}`,
    `Unpaid invoices: ${invoices.map((i) => `${i.number} £${Number(i.amount) + Number(i.tax)} due ${i.dueAt.toISOString().slice(0, 10)} (${i.company.name})`).join("; ") || "none"}`,
    `Active subscriptions: ${subs.length}`,
    `Mazidi companies this client does NOT yet use (cross-sell candidates): ${recommendations.map((r) => r.name).join(", ") || "none"}`,
  ].join("\n");

  const system = `You are the Mazidi Group AI Business Advisor inside the client portal.
Mazidi Group is a connected ecosystem of 21 specialist companies (Build It / Run It / Grow It) sharing one account.
Ground every answer in the ACCOUNT CONTEXT below. Be concise, concrete and warm. Where genuinely relevant,
suggest the next Mazidi company in the client's journey — never push more than one suggestion per reply.
Never invent invoices, projects or figures that are not in the context.

${context}`;

  return chat(userId, "ADVISOR", system, message);
}

// ── Team: CRM assistant (grounded in membership-scoped pipeline) ──

export async function teamAssistantChat(userId: string, ctx: TeamContext, message: string) {
  const scope = { companyId: { in: ctx.companyIds } };
  const [newLeads, deals, tasks, companies] = await Promise.all([
    prisma.lead.count({ where: { ...scope, status: "NEW" } }),
    prisma.deal.findMany({
      where: { ...scope, stage: { notIn: ["WON", "LOST"] } },
      select: { title: true, value: true, stage: true, company: { select: { name: true } } },
      orderBy: { value: "desc" }, take: 8,
    }),
    prisma.task.count({ where: { ...scope, assigneeId: userId, status: { not: "DONE" } } }),
    prisma.company.findMany({ where: { id: { in: ctx.companyIds } }, select: { name: true } }),
  ]);

  const context = [
    "CRM CONTEXT (live database, scoped to this employee's companies):",
    `Companies in scope: ${companies.map((c) => c.name).join(", ")}`,
    `Untriaged NEW leads: ${newLeads}`,
    `Open deals (top by value): ${deals.map((d) => `"${d.title}" £${Number(d.value)} @ ${d.stage} (${d.company.name})`).join("; ") || "none"}`,
    `My open tasks: ${tasks}`,
  ].join("\n");

  const system = `You are the Mazidi Group CRM assistant inside the employee portal.
Help the employee prioritise leads, move deals forward and plan their day, grounded strictly in the CRM CONTEXT below.
Lead funnel: NEW → QUALIFIED → CONTACTED → CONVERTED (LOST is terminal). Deals: LEAD → QUALIFIED → PROPOSAL → NEGOTIATION → WON.
Winning a deal triggers the group's cross-sell automations. Be concise and action-oriented; suggest specific next steps.
Never invent records that are not in the context.

${context}`;

  return chat(userId, "SUPPORT", system, message);
}
