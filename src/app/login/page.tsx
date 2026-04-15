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
  ShoppingBasket,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { login } from "@/lib/auth";
import { cn } from "@/lib/utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const nextUrl = params.get("next") ?? "/";
  const justSignedUp = params.get("signup") === "success";

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
    const result = await login(email, password, { rememberMe });
    setLoading(false);
    if (!result.ok) {
      setServerError(result.error ?? "Login failed");
      return;
    }
    router.push(nextUrl);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-bg-cream flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link href="/" className="flex items-center gap-2 justify-center mb-8 group">
          <div className="w-10 h-10 bg-shop-yellow rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
            <ShoppingBasket className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase text-shop-black">
            Sticker<span className="text-shop-yellow">Flix</span>
          </span>
        </Link>

        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-black/5 border border-gray-100">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-shop-black text-center">
            Welcome Back
          </h1>
          <div className="h-1 w-12 bg-shop-yellow rounded-full mx-auto mt-2 mb-6" />
          <p className="text-center text-sm text-gray-500 mb-8">
            Log in to continue to your account
          </p>

          {justSignedUp && (
            <div className="flex items-start gap-2 mb-6 p-3 rounded-xl bg-green-50 border border-green-100 text-green-600 text-sm">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Account created! Please log in to continue.</span>
            </div>
          )}

          {serverError && (
            <div className="flex items-start gap-2 mb-6 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="email"
                className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={cn(
                    "w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl border-2 text-sm text-shop-black outline-none transition-colors",
                    errors.email
                      ? "border-red-200 focus:border-red-400"
                      : "border-transparent focus:border-shop-yellow"
                  )}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 font-medium mt-1.5">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={cn(
                    "w-full pl-11 pr-11 py-3 bg-gray-50 rounded-xl border-2 text-sm text-shop-black outline-none transition-colors",
                    errors.password
                      ? "border-red-200 focus:border-red-400"
                      : "border-transparent focus:border-shop-yellow"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-shop-black transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 font-medium mt-1.5">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 accent-shop-yellow cursor-pointer"
                />
                <span className="text-xs text-gray-500 font-medium">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-bold text-shop-yellow hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-shop-yellow text-white py-4 rounded-full font-black uppercase tracking-widest text-xs hover:bg-shop-black transition-all shadow-lg shadow-shop-yellow/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Logging in…
                </>
              ) : (
                "Log In"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-shop-yellow font-black hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        <p className="text-center text-[10px] text-gray-400 mt-6 font-medium uppercase tracking-widest">
          Admin?{" "}
          <Link href="/admin/login" className="text-shop-black hover:text-shop-yellow transition-colors">
            Admin login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg-cream flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-shop-yellow" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
