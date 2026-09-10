"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/db";
import { journals, entries, shareTokens } from "@/db/schema";
import {
  createSessionCookie,
  clearSessionCookie,
  getSession,
  hashPassword,
  verifyPassword,
  type JournalSession,
} from "@/lib/auth";

let cachedJournalId: string | null = null;

export async function ensureJournal() {
  if (cachedJournalId) {
    const existing = await db.query.journals.findFirst({
      where: eq(journals.id, cachedJournalId),
    });
    if (existing) return existing;
  }

  const existing = await db.query.journals.findFirst();
  if (existing) {
    cachedJournalId = existing.id;
    return existing;
  }

  const password = process.env.JOURNAL_PASSWORD;
  if (!password) {
    throw new Error("JOURNAL_PASSWORD environment variable is not set");
  }

  const hashed = await hashPassword(password);
  const [journal] = await db
    .insert(journals)
    .values({
      name: "Khushi Singh",
      passwordHash: hashed,
    })
    .returning();

  cachedJournalId = journal.id;
  return journal;
}

export async function authenticateAdmin(password: string) {
  const journal = await ensureJournal();
  const valid = await verifyPassword(password, journal.passwordHash);
  if (!valid) return { success: false, error: "The key doesn't fit this heart." };

  await createSessionCookie({ journalId: journal.id, readOnly: false });
  return { success: true };
}

export async function authenticateShare(token: string, password: string) {
  const journal = await ensureJournal();
  const share = await db.query.shareTokens.findFirst({
    where: eq(shareTokens.token, token),
  });

  if (!share || !share.active || share.journalId !== journal.id) {
    return { success: false, error: "This whispered link has faded." };
  }

  const valid = await verifyPassword(password, journal.passwordHash);
  if (!valid) return { success: false, error: "The key doesn't fit this heart." };

  await createSessionCookie({ journalId: journal.id, readOnly: true });
  return { success: true };
}

export async function logout() {
  await clearSessionCookie();
}

export async function getCurrentSession(): Promise<JournalSession | null> {
  return getSession();
}

export async function fetchEntries() {
  const session = await getSession();
  if (!session) return { entries: [], readOnly: true };

  const journal = await ensureJournal();
  if (session.journalId !== journal.id) return { entries: [], readOnly: true };

  const data = await db.query.entries.findMany({
    where: eq(entries.journalId, journal.id),
    orderBy: (entries, { desc }) => [desc(entries.entryDate)],
  });

  return { entries: data, readOnly: session.readOnly };
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024;

export async function createEntry(formData: FormData) {
  const session = await getSession();
  if (!session || session.readOnly) {
    return { success: false, error: "Only the keeper of this journal may write here." };
  }

  const journal = await ensureJournal();
  if (session.journalId !== journal.id) {
    return { success: false, error: "Only the keeper of this journal may write here." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const entryDate = String(formData.get("entryDate") ?? "").trim();
  const photo = formData.get("photo") as File | null;

  if (!title || !content || !entryDate) {
    return { success: false, error: "A memory needs a title, a story, and a date." };
  }

  let imageUrl: string | undefined;

  if (photo && photo.size > 0) {
    if (!ALLOWED_TYPES.includes(photo.type)) {
      return { success: false, error: "Please share a photo in JPG, PNG, WebP, or GIF format." };
    }
    if (photo.size > MAX_SIZE) {
      return { success: false, error: "This photo is too large. Keep it under 5MB." };
    }

    const ext = photo.type.split("/")[1] || "jpg";
    const filename = `${uuidv4()}.${ext}`;
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    const buffer = Buffer.from(await photo.arrayBuffer());
    await writeFile(path.join(uploadsDir, filename), buffer);
    imageUrl = `/uploads/${filename}`;
  }

  await db.insert(entries).values({
    journalId: journal.id,
    title,
    content,
    entryDate,
    imageUrl,
  });

  revalidatePath("/journal");
  return { success: true };
}

export async function deleteEntry(id: string) {
  const session = await getSession();
  if (!session || session.readOnly) {
    return { success: false, error: "Only the keeper may remove memories." };
  }

  const journal = await ensureJournal();
  if (session.journalId !== journal.id) {
    return { success: false, error: "Only the keeper may remove memories." };
  }

  await db.delete(entries).where(eq(entries.id, id));
  revalidatePath("/journal");
  return { success: true };
}

export async function createShareToken() {
  const session = await getSession();
  if (!session || session.readOnly) {
    return { success: false, error: "Only the keeper may share this journal." };
  }

  const journal = await ensureJournal();
  if (session.journalId !== journal.id) {
    return { success: false, error: "Only the keeper may share this journal." };
  }

  const [share] = await db
    .insert(shareTokens)
    .values({ journalId: journal.id })
    .returning();

  return { success: true, token: share.token };
}
