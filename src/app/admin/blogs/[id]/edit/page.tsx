"use client";

import React, { useEffect, useState, use } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { BlogForm } from "@/components/admin/BlogForm";
import { Blog } from "@/lib/blog-seo";

export default function AdminEditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch(`/api/admin/blogs/${id}`)
      .then((r) => r.json())
      .then((body) => {
        if (!mounted) return;
        if (!body.success) setError(body.error ?? "Blog not found");
        else setBlog(body.data);
      })
      .catch(() => mounted && setError("Failed to load blog"))
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

  if (error || !blog) {
    return (
      <div className="flex items-start gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm max-w-xl">
        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
        <span>{error ?? "Blog not found"}</span>
      </div>
    );
  }

  return <BlogForm mode="edit" initial={blog} />;
}
