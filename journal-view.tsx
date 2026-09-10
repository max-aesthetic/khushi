"use client";

import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookHeart,
  LogOut,
  Share2,
  Plus,
  X,
  Camera,
  Calendar,
  Save,
  Trash2,
  Copy,
  Check,
  Lock,
  Heart,
  Sparkles,
  Feather,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { createEntry, deleteEntry, createShareToken, logout } from "@/lib/actions";
import type { Entry } from "@/db/schema";
import { useRouter } from "next/navigation";

export default function JournalView({
  entries,
  readOnly,
  baseUrl,
}: {
  entries: Entry[];
  readOnly: boolean;
  baseUrl: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [shareLoading, setShareLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/");
    router.refresh();
  }

  async function handleShare() {
    setShareLoading(true);
    const result = await createShareToken();
    if (result.success && result.token) {
      setShareUrl(`${baseUrl}/share/${result.token}`);
      setShareOpen(true);
    }
    setShareLoading(false);
  }

  function copyLink() {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative z-10 min-h-screen px-4 pb-24 pt-8 md:px-8 md:pt-12">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blush-200 to-rose-gold text-warm-900 shadow-lg">
            <BookHeart className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-playfair text-2xl font-semibold text-warm-900 md:text-3xl">
              Khushi&apos;s Journal
            </h1>
            <p className="font-cormorant text-base italic text-warm-800">
              {readOnly ? "Shared memories, read with love" : "A sanctuary for your stories"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!readOnly && (
            <button
              onClick={handleShare}
              disabled={shareLoading}
              className="flex items-center gap-2 rounded-full glass px-4 py-2.5 text-sm font-medium text-warm-900 shadow-sm transition-all hover:shadow-md"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">{shareLoading ? "Creating…" : "Share"}</span>
            </button>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-full bg-warm-900 px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:bg-warm-800"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Close</span>
          </button>
        </div>
      </motion.header>

      {/* Hero greeting */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-auto mt-10 max-w-4xl text-center"
      >
        <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-rose-gold shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
          {readOnly ? "Private shared view" : "Welcome back, Khushi"}
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <h2 className="font-playfair mt-4 text-[clamp(2rem,5vw,3.5rem)] font-medium leading-[1.1] text-warm-900">
          Every memory is a page <br className="hidden sm:block" /> in your love story.
        </h2>
      </motion.section>

      {/* Add memory trigger */}
      {!readOnly && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-10 flex max-w-6xl justify-center"
        >
          <button
            onClick={() => setShowForm((s) => !s)}
            className="group flex items-center gap-3 rounded-full bg-gradient-to-r from-rose-gold to-rose-gold-light px-7 py-3.5 text-sm font-semibold uppercase tracking-widest text-white shadow-lg transition-all hover:shadow-xl"
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Close Writer" : "Write a New Memory"}
          </button>
        </motion.div>
      )}

      {/* Entry form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-auto mt-8 max-w-2xl overflow-hidden"
          >
            <EntryForm onCancel={() => setShowForm(false)} onSaved={() => setShowForm(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline */}
      <section className="mx-auto mt-14 max-w-6xl">
        {entries.length === 0 ? (
          <EmptyState readOnly={readOnly} />
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-rose-gold/0 via-rose-gold to-rose-gold/0 md:left-1/2" />
            <div className="space-y-12 md:space-y-20">
              {entries.map((entry, index) => (
                <TimelineItem
                  key={entry.id}
                  entry={entry}
                  index={index}
                  readOnly={readOnly}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Share modal */}
      <AnimatePresence>
        {shareOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-warm-900/40 p-4 backdrop-blur-sm"
            onClick={() => setShareOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-[2rem] glass p-8 text-center shadow-polaroid"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blush-200 text-warm-900">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="font-playfair mt-4 text-2xl font-medium text-warm-900">
                Private Link Created
              </h3>
              <p className="mt-2 text-sm text-warm-800/70">
                Anyone with this link will still need the journal password to open it.
              </p>
              <div className="mt-6 flex items-center gap-2 rounded-2xl border border-warm-200 bg-white/70 p-2">
                <input
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-transparent px-3 text-sm text-warm-900 outline-none"
                />
                <button
                  onClick={copyLink}
                  className="flex items-center gap-1.5 rounded-xl bg-warm-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-warm-800"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <button
                onClick={() => setShareOpen(false)}
                className="mt-6 text-sm font-medium text-warm-800 underline-offset-4 hover:underline"
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EntryForm({ onCancel, onSaved }: { onCancel: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("entryDate", entryDate);
    if (photo) formData.append("photo", photo);

    const result = await createEntry(formData);
    if (result.success) {
      setTitle("");
      setContent("");
      setPhoto(null);
      setPreview(null);
      router.refresh();
      onSaved();
    } else {
      setError(result.error || "Could not save this memory.");
    }
    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass rounded-[2rem] p-6 shadow-polaroid md:p-8"
    >
      <div className="flex items-center gap-2 text-rose-gold">
        <Feather className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-[0.15em]">New Memory</span>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-warm-800">
            <Heart className="h-3.5 w-3.5" /> Title
          </label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="A little title for the heart"
            className="w-full rounded-xl border border-warm-200 bg-white/70 px-4 py-3 text-warm-900 placeholder:text-warm-800/40 focus:border-rose-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blush-200"
          />
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-warm-800">
            <Calendar className="h-3.5 w-3.5" /> Date
          </label>
          <input
            required
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            className="w-full rounded-xl border border-warm-200 bg-white/70 px-4 py-3 text-warm-900 focus:border-rose-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blush-200"
          />
        </div>
      </div>

      <div className="mt-5">
        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-warm-800">
          <Feather className="h-3.5 w-3.5" /> Your Story
        </label>
        <textarea
          required
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What happened today? How did it feel?"
          className="w-full resize-none rounded-xl border border-warm-200 bg-white/70 px-4 py-3 text-warm-900 placeholder:text-warm-800/40 focus:border-rose-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blush-200"
        />
      </div>

      <div className="mt-5">
        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-warm-800">
          <Camera className="h-3.5 w-3.5" /> Photo
        </label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-rose-gold/40 bg-white/40 px-4 py-6 text-sm text-warm-800 transition-colors hover:bg-white/70"
        >
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="h-40 w-auto rounded-lg object-cover shadow-md"
            />
          ) : (
            <>
              <Camera className="h-6 w-6 text-rose-gold" />
              <span>Tap to choose a photo</span>
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {error && <p className="mt-4 text-center text-sm text-rose-500">{error}</p>}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-warm-200 bg-white/60 px-6 py-2.5 text-sm font-medium text-warm-900 transition-colors hover:bg-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl bg-warm-900 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-warm-800 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {loading ? "Saving…" : "Save Memory"}
        </button>
      </div>
    </form>
  );
}

function TimelineItem({
  entry,
  index,
  readOnly,
}: {
  entry: Entry;
  index: number;
  readOnly: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isLeft = index % 2 === 0;

  async function handleDelete() {
    if (!confirm("Are you sure you want to let this memory fade away?")) return;
    setDeleting(true);
    await deleteEntry(entry.id);
  }

  const formattedDate = useMemo(() => {
    try {
      return format(parseISO(entry.entryDate), "MMMM d, yyyy");
    } catch {
      return entry.entryDate;
    }
  }, [entry.entryDate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`relative flex items-center ${
        isLeft ? "md:flex-row" : "md:flex-row-reverse"
      } flex-col gap-6 md:gap-12`}
    >
      {/* Timeline dot */}
      <div className="absolute left-4 top-1/2 z-20 hidden h-4 w-4 -translate-y-1/2 rounded-full border-4 border-blush-100 bg-rose-gold shadow md:left-1/2 md:block md:-translate-x-1/2" />

      {/* Content side */}
      <div className={`w-full md:w-1/2 ${isLeft ? "md:pr-12" : "md:pl-12"}`}>
        <div className="text-center md:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-gold shadow-sm">
            <Calendar className="h-3 w-3" />
            {formattedDate}
          </span>
        </div>
      </div>

      {/* Card side */}
      <div className="flex w-full justify-center md:w-1/2">
        <div
          className="perspective-1000 w-full max-w-sm cursor-pointer"
          onClick={() => setFlipped((f) => !f)}
        >
          <motion.div
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.7, type: "spring", stiffness: 120, damping: 16 }}
            className="preserve-3d relative aspect-[4/5] w-full"
            whileHover={{ scale: 1.02, rotateZ: isLeft ? -1 : 1 }}
          >
            {/* Front face */}
            <div className="absolute inset-0 backface-hidden overflow-hidden rounded-[1.5rem] bg-white p-4 shadow-polaroid transition-shadow hover:shadow-polaroid-hover">
              <div className="relative h-full w-full overflow-hidden rounded-xl bg-warm-100">
                {entry.imageUrl ? (
                  <img
                    src={entry.imageUrl}
                    alt={entry.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-warm-800/40">
                    <Heart className="h-12 w-12 animate-heartbeat" />
                    <span className="text-sm">No photo attached</span>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-warm-900/70 to-transparent p-5">
                  <h3 className="font-playfair text-xl text-white">{entry.title}</h3>
                  <p className="mt-1 text-xs text-white/80">Tap to read the story</p>
                </div>
              </div>
            </div>

            {/* Back face */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-[1.5rem] bg-gradient-to-br from-warm-50 to-blush-50 p-6 shadow-polaroid">
              <div className="flex h-full flex-col">
                <div className="mb-4 flex items-center justify-between">
                  <Heart className="h-5 w-5 text-rose-gold" />
                  <span className="text-xs font-medium text-warm-800/60">{formattedDate}</span>
                </div>
                <h3 className="font-playfair text-2xl font-medium text-warm-900">{entry.title}</h3>
                <div className="my-4 h-px bg-rose-gold/30" />
                <p className="font-cormorant flex-1 overflow-auto text-lg leading-relaxed text-warm-800">
                  {entry.content}
                </p>
                {!readOnly && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                    disabled={deleting}
                    className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-rose-100 px-4 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-200"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {deleting ? "Removing…" : "Remove Memory"}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ readOnly }: { readOnly: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto flex max-w-lg flex-col items-center rounded-[2rem] glass p-10 text-center shadow-polaroid"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blush-200 text-warm-900">
        <BookHeart className="h-7 w-7" />
      </div>
      <h3 className="font-playfair mt-5 text-2xl text-warm-900">
        {readOnly ? "No shared memories yet" : "Your journal is waiting"}
      </h3>
      <p className="mt-2 text-sm text-warm-800/70">
        {readOnly
          ? "The keeper hasn't added any memories to this shared view."
          : "Begin your story by adding the first photo and written memory."}
      </p>
    </motion.div>
  );
}
