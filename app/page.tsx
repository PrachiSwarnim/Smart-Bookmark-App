"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "../lib/supabase";

/* ═══════════════════════════════════════════════
   ICONS (inline SVG — no dependencies)
   ═══════════════════════════════════════════════ */

const BookmarkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
  </svg>
);

const FolderIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" /><path d="M12 5v14" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

const ExternalIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const LinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" />
  </svg>
);

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const XIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

/* ═══════════════════════════════════════════════
   FOLDER COLOR PALETTE
   ═══════════════════════════════════════════════ */

const FOLDER_COLORS = [
  { bg: "bg-rose-500/15", text: "text-rose-400", border: "border-rose-500/25", active: "bg-rose-500", dot: "bg-rose-400" },
  { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/25", active: "bg-amber-500", dot: "bg-amber-400" },
  { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/25", active: "bg-emerald-500", dot: "bg-emerald-400" },
  { bg: "bg-cyan-500/15", text: "text-cyan-400", border: "border-cyan-500/25", active: "bg-cyan-500", dot: "bg-cyan-400" },
  { bg: "bg-violet-500/15", text: "text-violet-400", border: "border-violet-500/25", active: "bg-violet-500", dot: "bg-violet-400" },
  { bg: "bg-pink-500/15", text: "text-pink-400", border: "border-pink-500/25", active: "bg-pink-500", dot: "bg-pink-400" },
  { bg: "bg-indigo-500/15", text: "text-indigo-400", border: "border-indigo-500/25", active: "bg-indigo-500", dot: "bg-indigo-400" },
  { bg: "bg-teal-500/15", text: "text-teal-400", border: "border-teal-500/25", active: "bg-teal-500", dot: "bg-teal-400" },
];

const getFolderColor = (index: number) => FOLDER_COLORS[index % FOLDER_COLORS.length];

/* ═══════════════════════════════════════════════
   TOAST SYSTEM
   ═══════════════════════════════════════════════ */

type Toast = { id: number; message: string; type: "success" | "error" | "info" };

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl animate-toast-in backdrop-blur-xl
            ${toast.type === "success" ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400" : ""}
            ${toast.type === "error" ? "bg-red-500/15 border border-red-500/30 text-red-400" : ""}
            ${toast.type === "info" ? "bg-blue-500/15 border border-blue-500/30 text-blue-400" : ""}
          `}
        >
          <span>
            {toast.type === "success" && "✓"}
            {toast.type === "error" && "✕"}
            {toast.type === "info" && "ℹ"}
          </span>
          <span className="flex-1">{toast.message}</span>
          <button onClick={() => onDismiss(toast.id)} className="opacity-50 hover:opacity-100 transition">
            <XIcon />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   HOME (Auth + Layout)
   ═══════════════════════════════════════════════ */

export default function Home() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    };
    init();
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  /* Loading */
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-3">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        <p className="text-sm text-muted">Loading your bookmarks…</p>
      </div>
    );
  }

  /* Auth screen */
  if (!user) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center gap-8 animate-fade-in">
          <div className="flex items-center gap-3 text-accent">
            <BookmarkIcon />
            <h1 className="text-4xl font-bold tracking-tight">Smart Bookmark</h1>
          </div>
          <p className="text-muted text-center max-w-sm leading-relaxed">
            Your personal, private bookmark manager.<br />
            Save, organize, and find your links instantly.
          </p>
          <button
            onClick={handleLogin}
            className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white text-zinc-900 font-medium
                       hover:bg-zinc-100 transition-all duration-200 shadow-lg shadow-white/10
                       hover:shadow-white/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <GoogleIcon />
            Continue with Google
          </button>
        </div>
      </main>
    );
  }

  /* Dashboard */
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="fixed top-0 left-1/4 w-[500px] h-[300px] bg-accent/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[250px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        <header className="flex justify-between items-center mb-12 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center text-accent">
              <BookmarkIcon />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Smart Bookmark</h1>
              <p className="text-xs text-muted">Your personal link vault</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border text-xs text-muted">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {user.email}
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white
                         hover:bg-zinc-800/60 transition-all duration-200"
            >
              Sign out
            </button>
          </div>
        </header>

        <Bookmarks userId={user.id} />
      </div>
    </main>
  );
}

/* ═══════════════════════════════════════════════
   BOOKMARKS (Main feature component)
   ═══════════════════════════════════════════════ */

function Bookmarks({ userId }: { userId: string }) {
  const supabase = createClient();

  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);
  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Ref to track selectedFolder for realtime callback
  const selectedFolderRef = useRef(selectedFolder);
  useEffect(() => { selectedFolderRef.current = selectedFolder; }, [selectedFolder]);

  /* ── Initial fetch ── */
  useEffect(() => { fetchFolders(); }, []);
  useEffect(() => { fetchBookmarks(); }, [selectedFolder]);

  /* ── Supabase REALTIME subscription ── */
  useEffect(() => {
    const channel = supabase
      .channel("bookmarks-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const currentFolder = selectedFolderRef.current;

          if (payload.eventType === "INSERT") {
            const newRow = payload.new as any;
            // Only add if it matches current folder filter (or "All")
            if (!currentFolder || newRow.folder_id === currentFolder) {
              setBookmarks((prev) => {
                // Avoid duplicates
                if (prev.find((b) => b.id === newRow.id)) return prev;
                return [newRow, ...prev];
              });
            }
            addToast("New bookmark synced", "info");
          } else if (payload.eventType === "DELETE") {
            const oldRow = payload.old as any;
            setBookmarks((prev) => prev.filter((b) => b.id !== oldRow.id));
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as any;
            setBookmarks((prev) =>
              prev.map((b) => (b.id === updated.id ? updated : b))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, addToast]);

  /* ── Fetch ── */

  const fetchBookmarks = async () => {
    let qb = supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (selectedFolder) qb = qb.eq("folder_id", selectedFolder);

    const { data, error } = await qb;
    if (error) {
      addToast("Failed to load bookmarks", "error");
      return;
    }
    setBookmarks(data || []);
  };

  const fetchFolders = async () => {
    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      addToast("Failed to load folders", "error");
      return;
    }
    setFolders(data || []);
  };

  /* ── Handlers ── */

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const title = (form.elements.namedItem("title") as HTMLInputElement).value.trim();
    const url = (form.elements.namedItem("url") as HTMLInputElement).value.trim();

    if (!title || !url) {
      addToast("Title and URL are required", "error");
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.from("bookmarks").insert({
      title,
      url,
      user_id: userId,
      folder_id: selectedFolder || null,
    });

    if (error) {
      addToast("Failed to add bookmark", "error");
      setIsSubmitting(false);
      return;
    }

    form.reset();
    await fetchBookmarks();
    addToast("Bookmark added!", "success");
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);

    const { error } = await supabase.from("bookmarks").delete().eq("id", id);
    if (error) {
      addToast("Failed to delete bookmark", "error");
      setIsDeleting(null);
      return;
    }

    await fetchBookmarks();
    addToast("Bookmark deleted", "success");
    setIsDeleting(null);
  };

  const handleEdit = async (id: string) => {
    if (!editTitle.trim() || !editUrl.trim()) {
      addToast("Title and URL cannot be empty", "error");
      return;
    }

    const { error } = await supabase
      .from("bookmarks")
      .update({ title: editTitle.trim(), url: editUrl.trim() })
      .eq("id", id);

    if (error) {
      addToast("Failed to update bookmark", "error");
      return;
    }

    setEditingId(null);
    await fetchBookmarks();
    addToast("Bookmark updated!", "success");
  };

  const handleTogglePin = async (id: string, currentPinned: boolean) => {
    const { error } = await supabase
      .from("bookmarks")
      .update({ is_pinned: !currentPinned })
      .eq("id", id);

    if (error) {
      addToast("Failed to update pin", "error");
      return;
    }

    await fetchBookmarks();
    addToast(currentPinned ? "Unpinned" : "Pinned to top!", "success");
  };

  const handleCreateFolder = async (name: string) => {
    if (!name) return;
    setIsSubmitting(true);

    const { data, error } = await supabase
      .from("folders")
      .insert({ name, user_id: userId })
      .select()
      .single();

    if (error) {
      addToast("Failed to create folder", "error");
      setIsSubmitting(false);
      return;
    }

    setSelectedFolder(data.id);
    await fetchFolders();
    addToast(`Folder "${name}" created!`, "success");
    setIsSubmitting(false);
  };

  const handleDeleteFolder = async (folderId: string, folderName: string) => {
    // First, unassign bookmarks in this folder (set folder_id to null)
    await supabase
      .from("bookmarks")
      .update({ folder_id: null })
      .eq("folder_id", folderId);

    const { error } = await supabase.from("folders").delete().eq("id", folderId);

    if (error) {
      addToast("Failed to delete folder", "error");
      return;
    }

    if (selectedFolder === folderId) setSelectedFolder(null);
    await fetchFolders();
    await fetchBookmarks();
    addToast(`Folder "${folderName}" deleted`, "success");
  };

  /* ── Derived ── */

  const filtered = bookmarks.filter((b) =>
    b.title.toLowerCase().includes(query.toLowerCase()) ||
    b.url.toLowerCase().includes(query.toLowerCase())
  );

  // Sort: pinned first, then by date
  const sorted = [...filtered].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return 0;
  });

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  const startEdit = (bookmark: any) => {
    setEditingId(bookmark.id);
    setEditTitle(bookmark.title);
    setEditUrl(bookmark.url);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditUrl("");
  };

  /* ── UI ── */
  return (
    <div className="space-y-8 animate-slide-up">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 group hover:border-accent/30 transition-all duration-300">
          <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Total Bookmarks</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            {bookmarks.length}
          </p>
        </div>
        <div className="glass-card rounded-2xl p-5 group hover:border-accent/30 transition-all duration-300">
          <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Folders</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            {folders.length}
          </p>
        </div>
        <div className="glass-card rounded-2xl p-5 group hover:border-accent/30 transition-all duration-300">
          <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Last Added</p>
          <p className="text-sm font-medium mt-1">
            {bookmarks[0]
              ? new Date(bookmarks[0].created_at).toLocaleDateString("en-IN", {
                day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
              })
              : "No bookmarks yet"}
          </p>
        </div>
      </div>

      {/* ── Folder + Search row ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"><FolderIcon /></span>
            <input
              id="folderInput"
              placeholder="New folder…"
              disabled={isSubmitting}
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  const input = e.target as HTMLInputElement;
                  const name = input.value.trim();
                  if (!name) { addToast("Folder name required", "error"); return; }
                  await handleCreateFolder(name);
                  input.value = "";
                }
              }}
              className="pl-9 pr-3 py-2.5 rounded-xl bg-card border border-border text-sm
                         placeholder:text-zinc-600 disabled:opacity-50 w-44 transition-all duration-200"
            />
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={async () => {
              const input = document.getElementById("folderInput") as HTMLInputElement;
              const name = input?.value.trim();
              if (!name) { addToast("Folder name required", "error"); return; }
              await handleCreateFolder(name);
              input.value = "";
            }}
            className="px-3 py-2.5 rounded-xl bg-accent/15 text-accent border border-accent/20
                       hover:bg-accent/25 transition-all duration-200 disabled:opacity-50"
          >
            <PlusIcon />
          </button>
        </div>

        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"><SearchIcon /></span>
          <input
            placeholder="Search bookmarks…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm
                       placeholder:text-zinc-600 transition-all duration-200"
          />
        </div>
      </div>

      {/* ── Folder Tabs (color-coded with delete) ── */}
      {folders.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedFolder(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${!selectedFolder
                ? "bg-accent text-white shadow-lg shadow-accent/20"
                : "bg-card border border-border text-muted hover:text-white hover:border-zinc-600"
              }`}
          >
            All
          </button>

          {folders.map((folder, idx) => {
            const color = getFolderColor(idx);
            const isActive = selectedFolder === folder.id;

            return (
              <div key={folder.id} className="relative group/folder flex items-center">
                <button
                  onClick={() => setSelectedFolder(folder.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 pr-7 ${isActive
                      ? `${color.active} text-white shadow-lg`
                      : `${color.bg} border ${color.border} ${color.text} hover:brightness-125`
                    }`}
                >
                  <div className={`w-2 h-2 rounded-full ${color.dot}`} />
                  {folder.name}
                </button>

                {/* Folder delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFolder(folder.id, folder.name);
                  }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full
                             flex items-center justify-center opacity-0 group-hover/folder:opacity-100
                             hover:bg-white/20 transition-all duration-200"
                  title={`Delete "${folder.name}"`}
                >
                  <XIcon />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add Bookmark Form ── */}
      <form
        onSubmit={handleAdd}
        className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">Aa</span>
          <input
            name="title"
            placeholder="Bookmark title"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background border border-border text-sm
                       placeholder:text-zinc-600 transition-all duration-200"
          />
        </div>
        <div className="relative flex-[1.5]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"><LinkIcon /></span>
          <input
            name="url"
            placeholder="https://example.com"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background border border-border text-sm
                       placeholder:text-zinc-600 transition-all duration-200"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-medium
                     hover:bg-accent-light transition-all duration-200 disabled:opacity-50
                     shadow-lg shadow-accent/20 hover:shadow-accent/30 hover:scale-[1.02] active:scale-[0.98]"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Adding…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <PlusIcon /> Add
            </span>
          )}
        </button>
      </form>

      {/* ── Bookmark List ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-muted uppercase tracking-wider">
            {selectedFolder
              ? folders.find((f) => f.id === selectedFolder)?.name
              : "All Bookmarks"}
          </h2>
          <span className="text-xs text-zinc-600">
            {sorted.length} link{sorted.length !== 1 ? "s" : ""}
            {sorted.filter((b) => b.is_pinned).length > 0 &&
              ` · ${sorted.filter((b) => b.is_pinned).length} pinned`}
          </span>
        </div>

        {sorted.length === 0 ? (
          <div className="glass-card rounded-2xl py-16 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-600">
              <BookmarkIcon />
            </div>
            <p className="text-muted text-sm">No bookmarks found</p>
            <p className="text-xs text-zinc-600">Add your first bookmark above</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map((bookmark, i) => {
              const isEditing = editingId === bookmark.id;

              return (
                <div
                  key={bookmark.id}
                  className={`group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${bookmark.is_pinned
                      ? "bg-accent/5 border-accent/20 hover:border-accent/40"
                      : "bg-card border-border hover:border-zinc-600 hover:bg-card-hover"
                    }`}
                >
                  {/* Pin button */}
                  <button
                    onClick={() => handleTogglePin(bookmark.id, bookmark.is_pinned)}
                    className={`shrink-0 transition-all duration-200 ${bookmark.is_pinned
                        ? "text-amber-400"
                        : "text-zinc-700 opacity-0 group-hover:opacity-100 hover:text-amber-400"
                      }`}
                    title={bookmark.is_pinned ? "Unpin" : "Pin to top"}
                  >
                    <StarIcon filled={bookmark.is_pinned} />
                  </button>

                  {/* Favicon */}
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden">
                    {getFaviconUrl(bookmark.url) ? (
                      <img
                        src={getFaviconUrl(bookmark.url)!}
                        alt=""
                        className="w-4 h-4"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <LinkIcon />
                    )}
                  </div>

                  {/* Content — Edit mode or View mode */}
                  {isEditing ? (
                    <div className="flex-1 flex flex-col sm:flex-row gap-2">
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-background border border-border text-sm"
                        autoFocus
                      />
                      <input
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-background border border-border text-sm"
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(bookmark.id)}
                          className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition"
                          title="Save"
                        >
                          <CheckIcon />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-700/50 transition"
                          title="Cancel"
                        >
                          <XIcon />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 min-w-0">
                      <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-sm hover:text-accent transition-colors duration-200
                                   flex items-center gap-1.5 group/link"
                      >
                        {bookmark.title}
                        <span className="opacity-0 group-hover/link:opacity-100 transition-opacity">
                          <ExternalIcon />
                        </span>
                      </a>
                      <p className="text-xs text-zinc-600 truncate max-w-md mt-0.5">
                        {bookmark.url}
                      </p>
                    </div>
                  )}

                  {/* Timestamp */}
                  {!isEditing && (
                    <span className="hidden sm:block text-[10px] text-zinc-600 shrink-0">
                      {new Date(bookmark.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                  )}

                  {/* Actions (Edit + Delete) */}
                  {!isEditing && (
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <button
                        onClick={() => startEdit(bookmark)}
                        className="p-2 rounded-lg text-zinc-600 hover:text-blue-400 hover:bg-blue-500/10 transition"
                        title="Edit"
                      >
                        <EditIcon />
                      </button>
                      <button
                        disabled={isDeleting === bookmark.id}
                        onClick={() => handleDelete(bookmark.id)}
                        className="p-2 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition disabled:opacity-50"
                        title="Delete"
                      >
                        {isDeleting === bookmark.id ? (
                          <span className="w-3.5 h-3.5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin block" />
                        ) : (
                          <TrashIcon />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
