"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Heart, Sparkles, ChevronRight } from "lucide-react";
import { authenticateAdmin } from "@/lib/actions";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await authenticateAdmin(password);
    if (result.success) {
      router.push("/journal");
      router.refresh();
    } else {
      setError(result.error || "Something went wrong.");
    }
    setLoading(false);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-blush-50/80 via-blush-50/60 to-warm-50/90" />
      <div className="absolute inset-0 bg-noise opacity-40" />

      {/* Floating ambient elements */}
      <FloatingElement className="left-[8%] top-[12%] h-24 w-24 delay-0" />
      <FloatingElement className="right-[10%] top-[20%] h-16 w-16 delay-700" reverse />
      <FloatingElement className="left-[15%] bottom-[18%] h-20 w-20 delay-500" />
      <FloatingElement className="right-[12%] bottom-[10%] h-28 w-28 delay-300" reverse />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="glass rounded-[2rem] p-8 shadow-polaroid md:p-10">
          <div className="mb-6 flex justify-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blush-200 to-rose-gold text-warm-900 shadow-lg"
            >
              <Heart className="h-7 w-7 fill-current" />
            </motion.div>
          </div>

          <h1 className="font-playfair text-center text-4xl font-semibold tracking-tight text-warm-900 md:text-5xl">
            Khushi Singh
          </h1>
          <p className="font-cormorant mt-3 text-center text-xl italic text-warm-800">
            a private digital journal
          </p>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-rose-gold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Protected by heart & key</span>
            <Sparkles className="h-3.5 w-3.5" />
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-warm-800/50" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter the secret key"
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
              <span className="relative z-10">{loading ? "Unlocking…" : "Unlock Journal"}</span>
              <ChevronRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" />
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </button>
          </form>

          <p className="mt-6 text-center text-xs leading-relaxed text-warm-800/60">
            This memory book belongs to Khushi Singh. <br />
            Share it only with those who hold the key.
          </p>
        </div>
      </motion.div>
    </main>
  );
}

function FloatingElement({
  className,
  reverse,
}: {
  className?: string;
  reverse?: boolean;
}) {
  return (
    <div
      className={`absolute rounded-full bg-gradient-to-br from-blush-200/60 to-rose-gold/40 blur-xl ${
        reverse ? "animate-float-reverse" : "animate-float"
      } ${className}`}
    />
  );
}
