import { redirect } from "next/navigation";
import { getUser } from "@mazidi/auth/server";
import { ensureEmployee, getConversation } from "@mazidi/api";
import { ChatPanel } from "@mazidi/ui";

export const dynamic = "force-dynamic";

export default async function AssistantPage() {
  const user = await getUser();
  if (!user) redirect("/login");
  const ctx = await ensureEmployee(user);
  if (!ctx) redirect("/");
  const messages = await getConversation(user.id, "SUPPORT");

  return (
    <>
      <div className="mb-7">
        <h2 className="mb-1 font-display text-[1.7rem] font-medium">CRM Assistant</h2>
        <p className="text-[.9rem] text-t2">Grounded in your scoped pipeline — leads, deals and tasks.</p>
      </div>
      <ChatPanel
        endpoint="/api/ai/assistant"
        title="Mazidi CRM Assistant"
        subtitle="Knows your pipeline · action-oriented"
        emptyHint="Try: “Which deal should I push this week?” or “Summarise my pipeline.”"
        initialMessages={messages.map((m) => ({ role: m.role, content: m.content }))}
      />
    </>
  );
}
