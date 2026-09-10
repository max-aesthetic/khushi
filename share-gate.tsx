"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Heart, Sparkles, ChevronRight } from "lucide-react";
import { authenticateShare } from "@/lib/actions";
import { useRouter } from "next/navigation";

export default function ShareGate({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await authenticateShare(token, password);
    if (result.success) {
      router.push("/journal");
      router.refresh();
    } else {
      setError(result.error || "Something went wrong.");
    }
    setLoading(false);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blush-50 via-warm-50 to-blush-100 px-6">
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-30" />

      {/* Floating accents */}
      <div className="absolute left-[10%] top-[15%] h-24 w-24 animate-float rounded-full bg-blush-200/50 blur-2xl" />
      <div className="absolute right-[12%] bottom-[12%] h-32 w-32 animate-float-reverse rounded-full bg-rose-gold/40 blur-2xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass rounded-[2rem] p-8 shadow-polaroid md:p-10">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blush-200 to-rose-gold text-warm-900 shadow-lg">
              <Heart className="h-7 w-7 fill-current" />
            </div>
          </div>

          <h1 className="font-playfair text-center text-3xl font-semibold text-warm-900 md:text-4xl">
            A Shared Whisper
          </h1>
          <p className="font-cormorant mt-3 text-center text-xl italic text-warm-800">
            Someone wants you to hold a piece of Khushi&apos;s heart.
          </p>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-rose-gold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Private link unlocked by password</span>
            <Sparkles className="h-3.5 w-3.5" />
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-warm-800/50" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter the journal password"
                className="w-full rounded-2xl border border-warm-200 bg-white/70 py-3.5 pl-12 pr-4 text-warm-900 placeholder:text-warm-800/40 focus:border-rose-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blush-200 transition-all"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="text-center text-sm text-rose-500"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-warm-900 to-warm-800 py-4 text-sm font-semibold uppercase tracking-widest text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-60"
            >
              <span className="relative z-10">{loading ? "Opening…" : "Open Shared Journal"}</span>
              <ChevronRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" />
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </button>
          </form>

          <p className="mt-6 text-center text-xs leading-relaxed text-warm-800/60">
            This is a private, password-protected link. <br />
            Please keep these memories safe.
          </p>
        </div>
      </motion.div>
    </main>
  );
}
