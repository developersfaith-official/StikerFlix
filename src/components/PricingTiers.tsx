"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Minus, Plus, Tag, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingTiersProps {
  basePrice: number;
  onQuantityChange?: (qty: number, unitPrice: number, total: number) => void;
}

const TIERS = [
  { label: "1–4", min: 1, max: 4, discount: 0, hint: "Standard" },
  { label: "5–9", min: 5, max: 9, discount: 10, hint: "10% off" },
  { label: "10+", min: 10, max: Infinity, discount: 20, hint: "Best deal" },
];

export const PricingTiers: React.FC<PricingTiersProps> = ({
  basePrice,
  onQuantityChange,
}) => {
  const [quantity, setQuantity] = useState(1);

  const currentTier = useMemo(
    () => TIERS.find((t) => quantity >= t.min && quantity <= t.max) ?? TIERS[0],
    [quantity]
  );

  const unitPrice = useMemo(
    () => +(basePrice * (1 - currentTier.discount / 100)).toFixed(2),
    [basePrice, currentTier]
  );

  const total = +(unitPrice * quantity).toFixed(2);
  const fullTotal = +(basePrice * quantity).toFixed(2);
  const savings = +(fullTotal - total).toFixed(2);

  const updateQty = useCallback(
    (newQty: number) => {
      const clamped = Math.max(1, Math.min(999, newQty));
      setQuantity(clamped);
      const tier =
        TIERS.find((t) => clamped >= t.min && clamped <= t.max) ?? TIERS[0];
      const up = +(basePrice * (1 - tier.discount / 100)).toFixed(2);
      onQuantityChange?.(clamped, up, +(up * clamped).toFixed(2));
    },
    [basePrice, onQuantityChange]
  );

  return (
    <div className="space-y-5">
      {/* ── Pricing tiers ── */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
          <Tag className="w-4 h-4 text-shop-yellow" />
          Pricing Tiers
        </h3>
        <div className="grid gap-2">
          {TIERS.map((tier) => {
            const isActive = tier === currentTier;
            const tierPrice = +(
              basePrice *
              (1 - tier.discount / 100)
            ).toFixed(2);
            return (
              <button
                key={tier.label}
                onClick={() => updateQty(tier.min)}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left",
                  isActive
                    ? "border-shop-yellow bg-shop-yellow/5"
                    : "border-gray-100 hover:border-gray-200"
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "text-sm font-bold",
                      isActive ? "text-shop-black" : "text-gray-500"
                    )}
                  >
                    {tier.label} units
                  </span>
                  {tier.discount > 0 && (
                    <span
                      className={cn(
                        "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded",
                        isActive
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-400"
                      )}
                    >
                      {tier.hint}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "text-sm font-black",
                      isActive ? "text-shop-black" : "text-gray-500"
                    )}
                  >
                    ${tierPrice}
                  </span>
                  {isActive && (
                    <div className="w-2 h-2 rounded-full bg-shop-yellow" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Quantity selector ── */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
          Quantity
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => updateQty(quantity - 1)}
            disabled={quantity <= 1}
            className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Minus className="w-4 h-4" />
          </button>
          <input
            type="number"
            min={1}
            max={999}
            value={quantity}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!Number.isNaN(v)) updateQty(v);
            }}
            className="w-20 h-10 text-center font-black text-lg bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-shop-yellow transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            onClick={() => updateQty(quantity + 1)}
            disabled={quantity >= 999}
            className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Price summary ── */}
      <div className="bg-gray-50 rounded-2xl p-5 space-y-2">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Unit price</span>
          <div className="flex items-center gap-2">
            {currentTier.discount > 0 && (
              <span className="text-xs text-gray-300 line-through">
                ${basePrice}
              </span>
            )}
            <span className="font-bold text-shop-black">${unitPrice}</span>
          </div>
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>
            {quantity} &times; ${unitPrice}
          </span>
          <span className="font-bold text-shop-black">${total}</span>
        </div>
        {savings > 0 && (
          <div className="flex justify-between text-sm text-green-600 pt-2 border-t border-dashed border-gray-200 mt-2">
            <span className="flex items-center gap-1">
              <TrendingDown className="w-3 h-3" /> You save
            </span>
            <span className="font-black">${savings}</span>
          </div>
        )}
        {currentTier.discount < 20 && (
          <p className="text-[11px] text-shop-yellow font-bold pt-2 border-t border-dashed border-gray-200 mt-2">
            {currentTier.discount === 0
              ? "Buy 5+ for 10% off each!"
              : "Buy 10+ for 20% off — best deal!"}
          </p>
        )}
      </div>
    </div>
  );
};
