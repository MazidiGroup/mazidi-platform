import { redirect } from "next/navigation";
import { getUser } from "@mazidi/auth/server";
import { ensureCustomer, getConversation } from "@mazidi/api";
import { ChatPanel } from "@mazidi/ui";

export const dynamic = "force-dynamic";

export default async function AdvisorPage() {
  const user = await getUser();
  if (!user) redirect("/login");
  await ensureCustomer(user);
  const messages = await getConversation(user.id, "ADVISOR");

  return (
    <>
      <div className="mb-7">
        <h2 className="mb-1 font-display text-[1.7rem] font-medium">AI Business Advisor</h2>
        <p className="text-[.9rem] text-t2">
          Grounded in your live account — projects, invoices and subscriptions. Conversations are saved.
        </p>
      </div>
      <ChatPanel
        endpoint="/api/ai/advisor"
        title="Mazidi Business Advisor"
        subtitle="Knows your account · suggests your next step in the ecosystem"
        emptyHint="Try: “What should I focus on this month?” or “What's outstanding on my account?”"
        initialMessages={messages.map((m) => ({ role: m.role, content: m.content }))}
      />
    </>
  );
}
