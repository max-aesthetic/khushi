import { notFound } from "next/navigation";
import ShareGate from "@/components/share-gate";
import { ensureJournal } from "@/lib/actions";
import { db } from "@/db";
import { shareTokens } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  await ensureJournal();
  const { token } = await params;

  const share = await db.query.shareTokens.findFirst({
    where: eq(shareTokens.token, token),
  });

  if (!share || !share.active) {
    notFound();
  }

  return <ShareGate token={token} />;
}
