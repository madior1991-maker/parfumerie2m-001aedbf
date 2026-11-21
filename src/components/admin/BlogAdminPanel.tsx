import { Link } from "@tanstack/react-router";
import { BookOpen, Edit3, Eye, EyeOff, Plus, Save, Search, Trash2, X } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import {
  estimateBlogReadTime,
  formatBlogDate,
  slugifyBlogText,
  splitBlogContent,
} from "@/lib/blog-data";
import { cn } from "@/lib/utils";

type BlogPostRow = Database["public"]["Tables"]["blog_posts"]["Row"];
type BlogPostInsert = Database["public"]["Tables"]["blog_posts"]["Insert"];

type BlogFormValues = {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  sort_order: number;
  is_published: boolean;
};

const blankBlogPost: BlogFormValues = {
  title: "",
  slug: "",
  category: "Conseils parfum",
  excerpt: "",
  content: "",
  cover_image_url: "",
  sort_order: 0,
  is_published: true,
};

export function BlogAdminPanel({ blogPosts, onRefresh }: { blogPosts: BlogPostRow[]; onRefresh: () => Promise<void> | void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<BlogFormValues>(blankBlogPost);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "hidden">("all");
  const [saving, setSaving] = useState(false);

  const filteredPosts = useMemo(
    () =>
      blogPosts.filter((post) => {
        const haystack = [post.title, post.category, post.excerpt, post.slug]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        const matchesQuery = haystack.includes(query.toLowerCase());
        const matchesStatus =
          status === "all" ||
          (status === "published" ? post.is_published : !post.is_published);
        return matchesQuery && matchesStatus;
      }),
    [blogPosts, query, status],
  );

  const startNewPost = () => {
    setEditingId(null);
    setForm(blankBlogPost);
    setShowForm(true);
  };

  const editPost = (post: BlogPostRow) => {
    setEditingId(post.id);
    setForm({
      title: post.title,
      slug: post.slug,
      category: post.category,
      excerpt: post.excerpt,
      content: post.content,
      cover_image_url: post.cover_image_url ?? "",
      sort_order: post.sort_order ?? 0,
      is_published: Boolean(post.is_published),
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setForm(blankBlogPost);
    setEditingId(null);
    setShowForm(false);
  };

  const savePost = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);

    const payload: BlogPostInsert = {
      title: form.title.trim(),
      slug: slugifyBlogText(form.slug || form.title),
      category: form.category.trim() || "Conseils parfum",
      excerpt: form.excerpt.trim(),
      content: form.content.trim(),
      cover_image_url: form.cover_image_url.trim() || null,
      sort_order: Number(form.sort_order) || 0,
      is_published: form.is_published,
    };

    const request = editingId
      ? supabase.from("blog_posts").update(payload).eq("id", editingId)
      : supabase.from("blog_posts").insert(payload);

    const { error } = await request;
    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(editingId ? "Article mis à jour" : "Article créé");
    resetForm();
    await onRefresh();
  };

  const togglePublish = async (post: BlogPostRow) => {
    const { error } = await supabase
      .from("blog_posts")
      .update({ is_published: !post.is_published })
      .eq("id", post.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(post.is_published ? "Article caché" : "Article publié");
    await onRefresh();
  };

  const deletePost = async (post: BlogPostRow) => {
    if (!window.confirm(`Supprimer l’article "${post.title}" ?`)) {
      return;
    }

    const { error } = await supabase.from("blog_posts").delete().eq("id", post.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Article supprimé");
    await onRefresh();
  };

  return (
    <section>
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl text-foreground sm:text-5xl">Blog</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {filteredPosts.length} article{filteredPosts.length > 1 ? "s" : ""} affiché
            {filteredPosts.length > 1 ? "s" : ""} sur {blogPosts.length}
          </p>
        </div>
        <Button className="min-h-12 w-full sm:w-auto" onClick={showForm ? () => setShowForm(false) : startNewPost}>
          {showForm ? <X /> : <Plus />} {showForm ? "Fermer" : "Nouvel article"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={savePost} className="mb-6 rounded-lg border border-border bg-card p-4 shadow-card sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="font-display text-3xl text-foreground">
                {editingId ? "Modifier l’article" : "Ajouter un article"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Le blog public n’affiche que les articles publiés.
              </p>
            </div>
            <label className="inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-border px-4 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(event) => setForm({ ...form, is_published: event.target.checked })}
              />
              Publié sur le site
            </label>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Field
              label="Titre"
              value={form.title}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  title: value,
                  slug:
                    current.slug === "" || current.slug === slugifyBlogText(current.title)
                      ? slugifyBlogText(value)
                      : current.slug,
                }))
              }
              required
            />
            <Field
              label="Slug"
              value={form.slug}
              onChange={(value) => setForm({ ...form, slug: value })}
              helper="Ex. : conseils-parfum-dakar"
              required
            />
            <Field
              label="Catégorie"
              value={form.category}
              onChange={(value) => setForm({ ...form, category: value })}
              required
            />
            <Field
              label="Ordre d’affichage"
              type="number"
              value={String(form.sort_order)}
              onChange={(value) => setForm({ ...form, sort_order: Number(value) })}
            />
            <Field
              label="Image de couverture"
              value={form.cover_image_url}
              onChange={(value) => setForm({ ...form, cover_image_url: value })}
              helper="Optionnel"
              className="md:col-span-2"
            />
            <Field
              label="Extrait"
              value={form.excerpt}
              onChange={(value) => setForm({ ...form, excerpt: value })}
              helper="Résumé court visible sur la carte d’article"
              className="md:col-span-2"
              required
            />
            <label className="grid gap-2 text-sm font-medium text-foreground md:col-span-2">
              Contenu
              <textarea
                className="min-h-48 rounded-md border border-border bg-background px-4 py-3 text-foreground"
                value={form.content}
                onChange={(event) => setForm({ ...form, content: event.target.value })}
                placeholder="Écrivez le contenu de l’article en plusieurs paragraphes séparés par une ligne vide."
                required
              />
            </label>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button type="button" variant="outline" onClick={resetForm} disabled={saving}>
              Annuler
            </Button>
            <Button type="submit" disabled={saving}>
              <Save /> {saving ? "Enregistrement…" : editingId ? "Mettre à jour" : "Créer l’article"}
            </Button>
          </div>
        </form>
      )}

      <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_220px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="min-h-12 w-full rounded-md border border-border bg-card py-3 pl-11 pr-4 text-foreground"
            placeholder="Rechercher titre, catégorie, slug"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <select
          className="min-h-12 rounded-md border border-border bg-card px-4 text-foreground"
          aria-label="Filtre de publication"
          value={status}
          onChange={(event) => setStatus(event.target.value as typeof status)}
        >
          <option value="all">Tous</option>
          <option value="published">Publiés</option>
          <option value="hidden">Masqués</option>
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredPosts.map((post) => {
          const paragraphs = splitBlogContent(post.content);
          return (
            <article key={post.id} className="rounded-lg border border-border bg-card p-4 shadow-card">
              <div className="flex items-start gap-4">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md bg-placeholder">
                  {post.cover_image_url ? (
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent-muted to-background text-accent">
                      <BookOpen className="size-7" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="line-clamp-2 font-semibold text-foreground">{post.title}</h2>
                      <p className="mt-1 text-xs text-muted-foreground">{post.category}</p>
                    </div>
                    <span
                      className={cn(
                        "rounded border px-2 py-1 text-xs font-semibold",
                        post.is_published
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border bg-background text-muted-foreground",
                      )}
                    >
                      {post.is_published ? "Publié" : "Masqué"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {estimateBlogReadTime(post.content)} · {formatBlogDate(post.created_at)}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm text-muted-foreground line-clamp-4">{post.excerpt}</p>
              <p className="mt-3 text-xs text-muted-foreground line-clamp-3">
                {paragraphs[0] ?? "Contenu vide"}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button type="button" variant="outline" onClick={() => editPost(post)}>
                  <Edit3 /> Modifier
                </Button>
                <Button type="button" variant="outline" onClick={() => togglePublish(post)}>
                  {post.is_published ? <EyeOff /> : <Eye />} {post.is_published ? "Masquer" : "Afficher"}
                </Button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
                  target="_blank"
                >
                  Voir
                </Link>
                <Button type="button" variant="outline" onClick={() => deletePost(post)}>
                  <Trash2 /> Supprimer
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  helper,
  className,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helper?: string;
  className?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className={cn("grid gap-2 text-sm font-medium text-foreground", className)}>
      {label}
      <input
        className="min-h-12 rounded-md border border-border bg-background px-4 py-3 text-foreground"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
      {helper && <span className="text-xs text-muted-foreground">{helper}</span>}
    </label>
  );
}
