import { redirect } from "next/navigation";
import JournalView from "@/components/journal-view";
import { getSession } from "@/lib/auth";
import { ensureJournal, fetchEntries } from "@/lib/actions";
import { getBaseUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  await ensureJournal();
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  const { entries, readOnly } = await fetchEntries();
  const baseUrl = await getBaseUrl();

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-blush-50 via-warm-50 to-blush-100">
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-30" />
      <JournalView entries={entries} readOnly={readOnly} baseUrl={baseUrl} />
    </main>
  );
}
