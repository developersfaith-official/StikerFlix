"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  CreditCard,
  Banknote,
  Wallet,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { getStickers, Sticker } from "@/data";
import { cn } from "@/lib/utils";

type PaymentMethod = "card" | "cod" | "wallet";

const PAYMENT_OPTIONS: {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: "card",
    label: "Credit / Debit Card",
    description: "Visa, MasterCard, American Express",
    icon: CreditCard,
  },
  {
    id: "cod",
    label: "Cash on Delivery",
    description: "Pay when your package arrives",
    icon: Banknote,
  },
  {
    id: "wallet",
    label: "Digital Wallet",
    description: "Apple Pay, Google Pay, PayPal",
    icon: Wallet,
  },
];

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    hydrated,
    increaseQuantity,
    decreaseQuantity,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [loadingStickers, setLoadingStickers] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [placing, setPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    let mounted = true;
    getStickers()
      .then((data) => {
        if (mounted) setStickers(data);
      })
      .finally(() => {
        if (mounted) setLoadingStickers(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Combine cart entries (id + qty) with full sticker info
  const enrichedCart = cart
    .map((item) => {
      const sticker = stickers.find((s) => s.id === item.id);
      return sticker ? { ...item, sticker } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const subtotal = enrichedCart.reduce(
    (sum, item) => sum + item.sticker.price * item.quantity,
    0
  );
  const shipping = subtotal === 0 ? 0 : subtotal >= 50 ? 0 : 4.99;
  const tax = +(subtotal * 0.08).toFixed(2);
  const total = +(subtotal + shipping + tax).toFixed(2);
  const totalUnits = enrichedCart.reduce((sum, i) => sum + i.quantity, 0);

  const handleConfirmOrder = () => {
    if (enrichedCart.length === 0 || placing) return;
    setPlacing(true);
    // Simulated order placement — replace with real API call when backend is ready
    setTimeout(() => {
      setOrderPlaced(true);
      clearCart();
      setPlacing(false);
    }, 900);
  };

  // Loading state (waits for both hydration and sticker fetch)
  if (!hydrated || loadingStickers) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-cream">
        <div className="flex items-center gap-3 text-shop-black font-black uppercase tracking-widest text-xs">
          <Loader2 className="w-4 h-4 animate-spin text-shop-yellow" />
          Loading your cart…
        </div>
      </div>
    );
  }

  // Order success state
  if (orderPlaced) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-cream px-4 text-center gap-6">
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 12 }}
          className="w-28 h-28 rounded-full bg-green-100 flex items-center justify-center"
        >
          <CheckCircle2 className="w-14 h-14 text-green-500" />
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-shop-black">
          Order Confirmed!
        </h1>
        <p className="text-gray-500 max-w-md font-medium leading-relaxed">
          Thank you for your purchase. We&apos;ll send a confirmation email
          shortly with your tracking details.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <Link
            href="/"
            className="bg-shop-yellow text-white font-black uppercase tracking-widest text-xs px-8 py-4 rounded-full hover:scale-105 transition-all shadow-lg shadow-shop-yellow/20"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (enrichedCart.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-cream px-4 text-center gap-6">
        <div className="w-28 h-28 rounded-full bg-shop-yellow/10 flex items-center justify-center">
          <ShoppingBag className="w-14 h-14 text-shop-yellow" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-shop-black">
          Your Cart Is Empty
        </h1>
        <p className="text-gray-500 max-w-md font-medium leading-relaxed">
          Looks like you haven&apos;t added any stickers yet. Browse our
          collection and find something you love.
        </p>
        <Link
          href="/"
          className="bg-shop-black text-white font-black uppercase tracking-widest text-xs px-8 py-4 rounded-full hover:bg-shop-yellow transition-all shadow-lg shadow-black/10"
        >
          Browse Stickers
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-12 md:pt-16 pb-20 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-shop-black mb-10 transition-all font-black uppercase text-xs tracking-widest group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Continue Shopping
        </button>

        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-shop-black leading-none">
            Your Cart
          </h1>
          <div className="h-1 w-16 bg-shop-yellow mt-3 rounded-full" />
          <p className="text-gray-500 mt-4 font-medium">
            {totalUnits} {totalUnits === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence initial={false}>
              {enrichedCart.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100 flex gap-4 md:gap-6 items-center"
                >
                  <Link
                    href={`/sticker/${item.sticker.id}`}
                    className="shrink-0 w-24 h-24 md:w-32 md:h-32 bg-gray-50 rounded-2xl overflow-hidden p-2"
                  >
                    <img
                      src={item.sticker.image}
                      alt={item.sticker.Title}
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="inline-block bg-shop-yellow/10 text-shop-yellow font-black uppercase tracking-widest text-[9px] px-3 py-1 rounded-full mb-2">
                          {item.sticker.category}
                        </span>
                        <Link href={`/sticker/${item.sticker.id}`}>
                          <h3 className="text-base md:text-lg font-black uppercase tracking-tight text-shop-black truncate hover:text-shop-yellow transition-colors">
                            {item.sticker.Title}
                          </h3>
                        </Link>
                        <p className="text-xs text-gray-400 font-bold mt-1">
                          ${item.sticker.price.toFixed(2)} each
                        </p>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        aria-label="Remove item"
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4 gap-4">
                      {/* Quantity controls */}
                      <div className="flex items-center bg-gray-50 rounded-full p-1">
                        <button
                          onClick={() => decreaseQuantity(item.id)}
                          aria-label="Decrease quantity"
                          className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-shop-black hover:bg-shop-yellow hover:text-white transition-all"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => {
                            const v = parseInt(e.target.value, 10);
                            if (!Number.isNaN(v))
                              updateQuantity(item.id, Math.max(1, v));
                          }}
                          className="w-10 text-center bg-transparent font-black text-shop-black text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          onClick={() => increaseQuantity(item.id)}
                          aria-label="Increase quantity"
                          className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-shop-black hover:bg-shop-yellow hover:text-white transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-lg md:text-xl font-black text-shop-black">
                        ${(item.sticker.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => clearCart()}
                className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors"
              >
                Clear cart
              </button>
            </div>
          </div>

          {/* Summary + payment */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Payment method */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-black uppercase tracking-tighter text-shop-black mb-1">
                  Payment Method
                </h2>
                <div className="h-1 w-10 bg-shop-yellow rounded-full mb-5" />

                <div className="space-y-3">
                  {PAYMENT_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const selected = paymentMethod === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setPaymentMethod(opt.id)}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left",
                          selected
                            ? "border-shop-yellow bg-shop-yellow/5"
                            : "border-gray-100 hover:border-gray-200"
                        )}
                      >
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                            selected
                              ? "bg-shop-yellow text-white"
                              : "bg-gray-50 text-gray-400"
                          )}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black uppercase tracking-widest text-shop-black">
                            {opt.label}
                          </p>
                          <p className="text-[11px] text-gray-400 font-medium mt-0.5 truncate">
                            {opt.description}
                          </p>
                        </div>
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full border-2 transition-colors shrink-0",
                            selected
                              ? "border-shop-yellow bg-shop-yellow"
                              : "border-gray-200"
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Order summary */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-black uppercase tracking-tighter text-shop-black mb-1">
                  Order Summary
                </h2>
                <div className="h-1 w-10 bg-shop-yellow rounded-full mb-5" />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-500 font-medium">
                    <span>Subtotal ({totalUnits} items)</span>
                    <span className="font-bold text-shop-black">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500 font-medium">
                    <span>Shipping</span>
                    <span className="font-bold text-shop-black">
                      {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500 font-medium">
                    <span>Tax (8%)</span>
                    <span className="font-bold text-shop-black">
                      ${tax.toFixed(2)}
                    </span>
                  </div>
                  {subtotal < 50 && subtotal > 0 && (
                    <p className="text-[10px] text-shop-yellow font-black uppercase tracking-widest pt-1">
                      Add ${(50 - subtotal).toFixed(2)} more for free shipping
                    </p>
                  )}
                </div>

                <div className="border-t border-dashed border-gray-200 my-5" />

                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Total
                  </span>
                  <span className="text-3xl font-black text-shop-black">
                    ${total.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={handleConfirmOrder}
                  disabled={placing}
                  className="mt-6 w-full bg-shop-black text-white font-black uppercase tracking-widest text-xs py-5 rounded-full hover:bg-shop-yellow transition-all shadow-xl shadow-black/10 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {placing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Placing Order…
                    </>
                  ) : (
                    "Confirm Order"
                  )}
                </button>

                <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <ShieldCheck className="w-4 h-4 text-shop-yellow" />
                    Secure Checkout
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <Truck className="w-4 h-4 text-shop-yellow" />
                    Fast Shipping
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
