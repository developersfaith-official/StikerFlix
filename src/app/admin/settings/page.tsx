"use client";

import React, { useEffect, useState } from "react";
import {
  Key,
  Users,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
  X,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "superadmin";
  created_at: string;
}

export default function AdminSettingsPage() {
  // Password change
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState(false);

  // Admin users
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  // New admin modal
  const [showNewAdmin, setShowNewAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    email: "",
    password: "",
    name: "",
    role: "admin" as "admin" | "superadmin",
  });
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchAdmins = async () => {
    setLoadingAdmins(true);
    const res = await fetch("/api/admin/admin-users");
    const body = await res.json();
    if (body.success) {
      setAdmins(body.data);
      setCurrentId(body.currentId);
    }
    setLoadingAdmins(false);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(false);
    if (newPwd.length < 8) {
      setPwdError("New password must be at least 8 characters");
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError("Passwords do not match");
      return;
    }
    setPwdSaving(true);
    const res = await fetch("/api/admin/settings/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
    });
    const body = await res.json();
    setPwdSaving(false);
    if (!res.ok) {
      setPwdError(body.error ?? "Failed to change password");
      return;
    }
    setPwdSuccess(true);
    setCurrentPwd("");
    setNewPwd("");
    setConfirmPwd("");
    setTimeout(() => setPwdSuccess(false), 3000);
  };

  const handleCreateAdmin = async () => {
    setCreatingAdmin(true);
    setCreateError(null);
    const res = await fetch("/api/admin/admin-users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAdmin),
    });
    const body = await res.json();
    setCreatingAdmin(false);
    if (!res.ok) {
      setCreateError(body.error ?? "Failed to create admin");
      return;
    }
    setShowNewAdmin(false);
    setNewAdmin({ email: "", password: "", name: "", role: "admin" });
    fetchAdmins();
  };

  const handleDeleteAdmin = async (id: string) => {
    if (!confirm("Delete this admin account? This cannot be undone.")) return;
    setDeleting(id);
    const res = await fetch(`/api/admin/admin-users/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAdmins((prev) => prev.filter((a) => a.id !== id));
    } else {
      const body = await res.json();
      alert(body.error ?? "Failed to delete");
    }
    setDeleting(null);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white">
          Settings
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Manage your account and admin users
        </p>
      </div>

      {/* ── Change password ──────────────────────────────── */}
      <section className="bg-[#161A21] border border-white/5 rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-1">
          <Key className="w-5 h-5 text-shop-yellow" />
          <h2 className="text-lg font-black uppercase tracking-tighter text-white">
            Change Password
          </h2>
        </div>
        <div className="h-1 w-10 bg-shop-yellow rounded-full mb-6" />

        {pwdError && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{pwdError}</span>
          </div>
        )}
        {pwdSuccess && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm mb-4">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Password changed successfully.</span>
          </div>
        )}

        <form
          onSubmit={handlePasswordChange}
          className="space-y-4 max-w-md"
        >
          <AdminField label="Current Password">
            <PwdInput value={currentPwd} onChange={setCurrentPwd} show={showPwd} onToggle={() => setShowPwd(!showPwd)} />
          </AdminField>
          <AdminField label="New Password">
            <PwdInput value={newPwd} onChange={setNewPwd} show={showPwd} onToggle={() => setShowPwd(!showPwd)} />
          </AdminField>
          <AdminField label="Confirm New Password">
            <PwdInput value={confirmPwd} onChange={setConfirmPwd} show={showPwd} onToggle={() => setShowPwd(!showPwd)} />
          </AdminField>

          <button
            type="submit"
            disabled={pwdSaving}
            className="flex items-center gap-2 bg-shop-yellow text-shop-black px-5 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-white transition-colors disabled:opacity-50"
          >
            {pwdSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Update Password
          </button>
        </form>
      </section>

      {/* ── Admin users ───────────────────────────────────── */}
      <section className="bg-[#161A21] border border-white/5 rounded-2xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-shop-yellow" />
            <h2 className="text-lg font-black uppercase tracking-tighter text-white">
              Admin Users
            </h2>
          </div>
          <button
            onClick={() => {
              setShowNewAdmin(true);
              setCreateError(null);
            }}
            className="flex items-center gap-2 bg-shop-yellow text-shop-black px-4 py-2 rounded-lg font-black uppercase tracking-widest text-[10px] hover:bg-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Admin
          </button>
        </div>
        <div className="h-1 w-10 bg-shop-yellow rounded-full mb-6" />

        {loadingAdmins ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {admins.map((a) => {
              const isYou = a.id === currentId;
              return (
                <div
                  key={a.id}
                  className="flex items-center gap-4 py-3"
                >
                  <div className="w-10 h-10 rounded-full bg-shop-yellow/10 text-shop-yellow font-black uppercase text-sm flex items-center justify-center shrink-0">
                    {a.name?.charAt(0) ?? "A"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-black text-white truncate">
                        {a.name}
                      </p>
                      {isYou && (
                        <span className="text-[9px] font-black uppercase tracking-wider text-shop-yellow bg-shop-yellow/10 px-2 py-0.5 rounded">
                          You
                        </span>
                      )}
                      {a.role === "superadmin" && (
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                          <ShieldCheck className="w-3 h-3" /> Superadmin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {a.email}
                    </p>
                  </div>
                  {!isYou && (
                    <button
                      onClick={() => handleDeleteAdmin(a.id)}
                      disabled={deleting === a.id}
                      className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors disabled:opacity-50"
                    >
                      {deleting === a.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Add admin modal ───────────────────────────────── */}
      {showNewAdmin && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowNewAdmin(false)}
        >
          <div
            className="bg-[#161A21] border border-white/10 rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black uppercase tracking-tighter text-white">
                Add Admin
              </h2>
              <button
                onClick={() => setShowNewAdmin(false)}
                className="text-gray-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
                {createError}
              </div>
            )}

            <div className="space-y-4">
              <AdminField label="Name">
                <input
                  type="text"
                  value={newAdmin.name}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, name: e.target.value })
                  }
                  className={inputCls}
                />
              </AdminField>
              <AdminField label="Email">
                <input
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, email: e.target.value })
                  }
                  className={inputCls}
                />
              </AdminField>
              <AdminField label="Password (min 8 chars)">
                <input
                  type="text"
                  value={newAdmin.password}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, password: e.target.value })
                  }
                  className={inputCls}
                />
              </AdminField>
              <AdminField label="Role">
                <select
                  value={newAdmin.role}
                  onChange={(e) =>
                    setNewAdmin({
                      ...newAdmin,
                      role: e.target.value as "admin" | "superadmin",
                    })
                  }
                  className={inputCls}
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </AdminField>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewAdmin(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 text-gray-300 font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAdmin}
                disabled={creatingAdmin}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-shop-yellow text-shop-black font-black uppercase tracking-widest text-xs hover:bg-white transition-colors disabled:opacity-50"
              >
                {creatingAdmin ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── helpers ──
const inputCls =
  "w-full px-4 py-3 bg-[#0F1115] rounded-xl border-2 border-white/5 text-sm text-white placeholder-gray-600 outline-none focus:border-shop-yellow transition-colors";

function AdminField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

function PwdInput({
  value,
  onChange,
  show,
  onToggle,
}: {
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="new-password"
        className={cn(inputCls, "pr-11")}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}
