"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ShoppingBasket,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { signup } from "@/lib/auth";
import { cn } from "@/lib/utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    acceptTerms: false,
  });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (form.name.trim().length < 2) errs.name = "Name must be at least 2 characters";
    if (!EMAIL_RE.test(form.email)) errs.email = "Please enter a valid email";
    if (form.password.length < 8) errs.password = "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    if (!form.acceptTerms) errs.acceptTerms = "You must accept the terms";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setLoading(true);
    const result = await signup(
      form.email,
      form.password,
      form.name,
      form.phone || undefined
    );
    setLoading(false);

    if (!result.ok) {
      setServerError(result.error ?? "Something went wrong");
      return;
    }
    router.push("/login?signup=success");
  };

  return (
    <div className="min-h-screen bg-bg-cream flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
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
            Create Account
          </h1>
          <div className="h-1 w-12 bg-shop-yellow rounded-full mx-auto mt-2 mb-6" />
          <p className="text-center text-sm text-gray-500 mb-8">
            Join StickerFlix and start collecting
          </p>

          {serverError && (
            <div className="flex items-start gap-2 mb-6 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Field
              label="Full Name"
              icon={User}
              type="text"
              name="name"
              placeholder="John Doe"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              error={errors.name}
              autoComplete="name"
            />
            <Field
              label="Email"
              icon={Mail}
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              error={errors.email}
              autoComplete="email"
            />
            <Field
              label="Phone (optional)"
              icon={Phone}
              type="tel"
              name="phone"
              placeholder="+1 555 123 4567"
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
              error={errors.phone}
              autoComplete="tel"
            />
            <PasswordField
              label="Password"
              value={form.password}
              onChange={(v) => setForm({ ...form, password: v })}
              show={showPwd}
              onToggle={() => setShowPwd(!showPwd)}
              error={errors.password}
              autoComplete="new-password"
            />
            <PasswordField
              label="Confirm Password"
              value={form.confirmPassword}
              onChange={(v) => setForm({ ...form, confirmPassword: v })}
              show={showConfirm}
              onToggle={() => setShowConfirm(!showConfirm)}
              error={errors.confirmPassword}
              autoComplete="new-password"
            />

            <label className="flex items-start gap-3 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={form.acceptTerms}
                onChange={(e) =>
                  setForm({ ...form, acceptTerms: e.target.checked })
                }
                className="mt-1 w-4 h-4 accent-shop-yellow cursor-pointer"
              />
              <span className="text-xs text-gray-500 leading-relaxed">
                I accept the{" "}
                <Link href="/terms" className="text-shop-yellow font-bold hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-shop-yellow font-bold hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </label>
            {errors.acceptTerms && (
              <p className="text-xs text-red-500 font-medium -mt-2">
                {errors.acceptTerms}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-shop-yellow text-white py-4 rounded-full font-black uppercase tracking-widest text-xs hover:bg-shop-black transition-all shadow-lg shadow-shop-yellow/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing up…
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-shop-yellow font-black hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// ── Shared field component ────────────────────────────────────────────
function Field({
  label,
  icon: Icon,
  type,
  name,
  placeholder,
  value,
  onChange,
  error,
  autoComplete,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  type: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className={cn(
            "w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl border-2 text-sm text-shop-black outline-none transition-colors",
            error
              ? "border-red-200 focus:border-red-400"
              : "border-transparent focus:border-shop-yellow"
          )}
        />
      </div>
      {error && <p className="text-xs text-red-500 font-medium mt-1.5">{error}</p>}
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
  error,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  error?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
        {label}
      </label>
      <div className="relative">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder="••••••••"
          className={cn(
            "w-full pl-11 pr-11 py-3 bg-gray-50 rounded-xl border-2 text-sm text-shop-black outline-none transition-colors",
            error
              ? "border-red-200 focus:border-red-400"
              : "border-transparent focus:border-shop-yellow"
          )}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-shop-black transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 font-medium mt-1.5">{error}</p>}
    </div>
  );
}
