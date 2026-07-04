import { redirect } from "next/navigation";
import { getUser } from "@mazidi/auth/server";
import { ensureCustomer, listDocuments } from "@mazidi/api";

export const dynamic = "force-dynamic";

const fmtSize = (b: number) => (b > 1_048_576 ? `${(b / 1_048_576).toFixed(1)} MB` : `${Math.ceil(b / 1024)} KB`);

export default async function DocumentsPage() {
  const user = await getUser();
  if (!user) redirect("/login");
  const customer = await ensureCustomer(user);
  const documents = await listDocuments(customer.id);

  return (
    <>
      <h2 className="mb-1 font-display text-[1.7rem] font-medium">Documents</h2>
      <p className="mb-7 text-[.9rem] text-t2">
        Shared vault across every engagement. Files live in Supabase Storage; downloads use signed URLs (docs/04 §/v1/documents).
      </p>
      <div className="rounded-md border border-line bg-bg2 p-6">
        {documents.length === 0 ? (
          <p className="py-4 text-[.88rem] text-t3">
            No documents yet. Contracts, drawings, accounts and reports from all your Mazidi companies will live here.
          </p>
        ) : (
          <ul>
            {documents.map((d) => (
              <li key={d.id} className="flex items-center gap-3.5 border-b border-line py-3.5 text-[.9rem] last:border-0">
                <span className="grid h-9 w-9 flex-none place-items-center rounded-[10px] bg-bg3" aria-hidden>▧</span>
                <div className="min-w-0 flex-1">
                  <b className="block truncate">{d.name}</b>
                  <span className="text-[.76rem] text-t3">
                    {d.mime} · {fmtSize(d.size)} · {d.createdAt.toLocaleDateString("en-GB")}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
