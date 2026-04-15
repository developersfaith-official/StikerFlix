"use client";

import React, { useEffect, useState } from "react";
import { ShoppingCart, AlertTriangle, Loader2, Copy, Check } from "lucide-react";

export default function AdminOrdersPage() {
  const [ready, setReady] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/admin/orders?ping=1")
      .then((r) => r.json())
      .then((body) => {
        setReady(!!body.ready);
      })
      .catch(() => setReady(false));
  }, []);

  if (ready === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
      </div>
    );
  }

  if (ready) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white">
            Orders
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Orders table is ready. Customer order flow + full orders UI coming in the next build pass.
          </p>
        </div>

        <div className="bg-[#161A21] border border-white/5 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-shop-yellow/10 text-shop-yellow flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <p className="text-sm font-black uppercase tracking-widest text-white">
            Orders table detected ✓
          </p>
          <p className="text-xs text-gray-500 mt-2 max-w-md mx-auto">
            The database is ready. Next step: wire customer checkout to create orders,
            then the full orders dashboard (list, detail, status updates).
          </p>
        </div>
      </div>
    );
  }

  const migrationPath = "supabase/migrations/0002_orders.sql";

  const copyPath = () => {
    navigator.clipboard.writeText(migrationPath);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white">
          Orders
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Database migration required
        </p>
      </div>

      <div className="bg-[#161A21] border border-shop-yellow/20 rounded-2xl p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-shop-yellow/10 text-shop-yellow flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-black uppercase tracking-tighter text-white">
              Migration needed
            </h2>
            <p className="text-sm text-gray-400 mt-2 leading-relaxed">
              The <code className="text-shop-yellow">orders</code> and{" "}
              <code className="text-shop-yellow">order_items</code> tables don&apos;t exist yet.
              Run the migration SQL in Supabase to unlock this section.
            </p>

            <ol className="space-y-3 mt-6 text-sm text-gray-400">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-shop-yellow/10 text-shop-yellow flex items-center justify-center text-xs font-black shrink-0">
                  1
                </span>
                <div>
                  Open the migration file in your project:
                  <button
                    onClick={copyPath}
                    className="flex items-center gap-2 mt-2 px-3 py-2 bg-[#0F1115] rounded-lg border border-white/5 text-xs font-mono text-shop-yellow hover:border-shop-yellow/30 transition-colors"
                  >
                    {migrationPath}
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-shop-yellow/10 text-shop-yellow flex items-center justify-center text-xs font-black shrink-0">
                  2
                </span>
                <div>
                  Copy its entire contents and paste into{" "}
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-shop-yellow hover:underline"
                  >
                    Supabase Dashboard
                  </a>{" "}
                  → <strong>SQL Editor</strong> → <strong>Run</strong>.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-shop-yellow/10 text-shop-yellow flex items-center justify-center text-xs font-black shrink-0">
                  3
                </span>
                <div>Refresh this page — the orders dashboard will unlock.</div>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
