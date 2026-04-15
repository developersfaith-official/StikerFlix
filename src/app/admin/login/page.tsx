"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { login } from "@/lib/auth";
import { cn } from "@/lib/utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function AdminLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const nextUrl = params.get("next") ?? "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!EMAIL_RE.test(email)) errs.email = "Please enter a valid email";
    if (password.length < 1) errs.password = "Password is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setLoading(true);
    const result = await login(email, password, { isAdmin: true, rememberMe });
    setLoading(false);
    if (!result.ok) {
      setServerError(result.error ?? "Login failed");
      return;
    }
    router.push(nextUrl);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#0F1115] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Ambient grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Yellow glow */}
      <div
        aria-hidden
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-shop-yellow/10 blur-[120px] pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo / identity */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 bg-shop-yellow rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase text-white">
            Sticker<span className="text-shop-yellow">Flix</span>
          </span>
        </div>

        <div className="bg-[#161A21] rounded-3xl p-8 shadow-2xl shadow-black/40 border border-white/5">
          <div className="flex items-center gap-2 justify-center mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-shop-yellow bg-shop-yellow/10 px-3 py-1 rounded-full">
              Admin Access
            </span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white text-center">
            Sign in
          </h1>
          <div className="h-1 w-12 bg-shop-yellow rounded-full mx-auto mt-2 mb-6" />
          <p className="text-center text-sm text-gray-400 mb-8">
            Enter your credentials to access the admin panel
          </p>

          {serverError && (
            <div className="flex items-start gap-2 mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="admin-email"
                className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="admin@example.com"
                  className={cn(
                    "w-full pl-11 pr-4 py-3 bg-[#0F1115] rounded-xl border-2 text-sm text-white placeholder-gray-600 outline-none transition-colors",
                    errors.email
                      ? "border-red-500/40 focus:border-red-500"
                      : "border-white/5 focus:border-shop-yellow"
                  )}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400 font-medium mt-1.5">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="admin-password"
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={cn(
                    "w-full pl-11 pr-11 py-3 bg-[#0F1115] rounded-xl border-2 text-sm text-white placeholder-gray-600 outline-none transition-colors",
                    errors.password
                      ? "border-red-500/40 focus:border-red-500"
                      : "border-white/5 focus:border-shop-yellow"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 font-medium mt-1.5">{errors.password}</p>
              )}
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-shop-yellow cursor-pointer"
              />
              <span className="text-xs text-gray-400 font-medium">Remember me</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-shop-yellow text-shop-black py-4 rounded-full font-black uppercase tracking-widest text-xs hover:bg-white transition-all shadow-lg shadow-shop-yellow/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-gray-500 mt-6 font-medium uppercase tracking-widest">
          Not an admin?{" "}
          <Link href="/login" className="text-gray-300 hover:text-shop-yellow transition-colors">
            Customer login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0F1115] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-shop-yellow" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
