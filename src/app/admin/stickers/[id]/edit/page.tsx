"use client";

import React, { useEffect, useState, use } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { StickerForm } from "@/components/admin/StickerForm";
import { Sticker } from "@/data";

export default function AdminEditStickerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [sticker, setSticker] = useState<Sticker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch(`/api/admin/stickers/${id}`)
      .then((r) => r.json())
      .then((body) => {
        if (!mounted) return;
        if (!body.success) {
          setError(body.error ?? "Sticker not found");
        } else {
          setSticker(body.data);
        }
      })
      .catch(() => mounted && setError("Failed to load sticker"))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
      </div>
    );
  }

  if (error || !sticker) {
    return (
      <div className="flex items-start gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm max-w-xl">
        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
        <span>{error ?? "Sticker not found"}</span>
      </div>
    );
  }

  return <StickerForm mode="edit" initial={sticker} />;
}
