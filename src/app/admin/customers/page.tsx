"use client";

import React, { useEffect, useState } from "react";
import { Search, Users, Loader2, Mail, Phone, BadgeCheck } from "lucide-react";

interface Customer {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  email_verified: boolean;
  created_at: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const fetchCustomers = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    const res = await fetch(`/api/admin/customers?${params}`);
    const body = await res.json();
    if (body.success) setCustomers(body.data);
    setLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white">
            Customers
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {loading ? "…" : `${customers.length} registered customer${customers.length === 1 ? "" : "s"}`}
          </p>
        </div>
      </div>

      <div className="bg-[#161A21] border border-white/5 rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-11 pr-4 py-2.5 bg-[#0F1115] rounded-xl border-2 border-white/5 text-sm text-white placeholder-gray-600 outline-none focus:border-shop-yellow/50 transition-colors"
          />
        </div>
      </div>

      <div className="bg-[#161A21] border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Users className="w-7 h-7 text-gray-600" />
            </div>
            <p className="text-sm font-black uppercase tracking-widest text-gray-400">
              No customers yet
            </p>
            <p className="text-xs text-gray-500 mt-2">
              When someone signs up, they&apos;ll appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {customers.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-shop-yellow/10 text-shop-yellow font-black uppercase text-sm flex items-center justify-center shrink-0">
                  {c.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-white truncate">
                      {c.name}
                    </p>
                    {c.email_verified && (
                      <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-green-400 bg-green-500/10 px-2 py-0.5 rounded">
                        <BadgeCheck className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3" />
                      {c.email}
                    </span>
                    {c.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3" />
                        {c.phone}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 font-medium shrink-0">
                  Joined{" "}
                  {new Date(c.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
