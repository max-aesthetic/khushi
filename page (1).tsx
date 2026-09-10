import { redirect } from "next/navigation";
import LandingPage from "@/components/landing-page";
import { getSession } from "@/lib/auth";
import { ensureJournal } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await ensureJournal();
  const session = await getSession();

  if (session) {
    redirect("/journal");
  }

  return <LandingPage />;
}
