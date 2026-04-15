"use client";

import { useEffect, useState } from "react";

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  subcategories: CategoryNode[];
}

// Module-level cache shared across all components. A single network request
// hydrates every consumer; call invalidateCategoriesCache() after mutations.
let cached: CategoryNode[] | null = null;
let inflight: Promise<CategoryNode[]> | null = null;
const subscribers = new Set<(v: CategoryNode[]) => void>();

async function loadFresh(): Promise<CategoryNode[]> {
  try {
    const res = await fetch("/api/categories");
    const body = await res.json();
    cached = body.categories ?? [];
    subscribers.forEach((fn) => fn(cached!));
    return cached!;
  } catch {
    cached = [];
    subscribers.forEach((fn) => fn([]));
    return [];
  } finally {
    inflight = null;
  }
}

function getOrFetch(): Promise<CategoryNode[]> {
  if (cached) return Promise.resolve(cached);
  if (!inflight) inflight = loadFresh();
  return inflight;
}

export function invalidateCategoriesCache() {
  cached = null;
  // Trigger a refresh for all mounted consumers
  loadFresh();
}

export function useCategories() {
  const [categories, setCategories] = useState<CategoryNode[]>(cached ?? []);
  const [loading, setLoading] = useState(cached === null);

  useEffect(() => {
    let mounted = true;
    const update = (v: CategoryNode[]) => {
      if (mounted) {
        setCategories(v);
        setLoading(false);
      }
    };
    subscribers.add(update);
    getOrFetch().then(update);
    return () => {
      mounted = false;
      subscribers.delete(update);
    };
  }, []);

  // Flat list of all names (top-level + subcategories), useful for filters
  const allNames = categories.flatMap((c) => [
    c.name,
    ...c.subcategories.map((s) => s.name),
  ]);

  return { categories, loading, allNames };
}
