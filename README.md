# 🔖 Smart Bookmark App

A modern, real-time bookmark manager built with Next.js and Supabase. Save, organize, and access your favorite links privately — with instant sync across all your devices.

🔗 **Live Demo:** [smart-bookmark-app-beta-teal.vercel.app](https://smart-bookmark-app-beta-teal.vercel.app)  
📦 **Repo:** [github.com/PrachiSwarnim/Smart-Bookmark-App](https://github.com/PrachiSwarnim/Smart-Bookmark-App)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Google OAuth** | Sign in with Google — no email/password needed |
| **Add Bookmarks** | Save any URL with a title |
| **Private to each user** | Your bookmarks are only visible to you (Row Level Security) |
| **Real-time sync** | Open two tabs — add a bookmark in one, it appears in the other instantly |
| **Delete bookmarks** | Remove bookmarks you no longer need |
| **Edit bookmarks** | Update title or URL inline |
| **Pin/Favorite** | Star important bookmarks to pin them to the top |
| **Folder organization** | Create color-coded folders to categorize your bookmarks |
| **Search** | Quickly filter bookmarks by title or URL |
| **Toast notifications** | Polished feedback for every action |

---

## 🛠️ Tech Stack

- **Frontend:** [Next.js 16](https://nextjs.org/) (App Router)
- **Auth:** [Supabase Auth](https://supabase.com/auth) (Google OAuth)
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Real-time:** [Supabase Realtime](https://supabase.com/realtime) (Postgres Changes)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Deployment:** [Vercel](https://vercel.com/)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project (free tier works)
- A Google OAuth app configured in Supabase

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/PrachiSwarnim/Smart-Bookmark-App.git
   cd Smart-Bookmark-App
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Set up Supabase tables**
   
   Run the following SQL in your Supabase SQL Editor:
   ```sql
   -- Bookmarks table
   CREATE TABLE bookmarks (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id uuid REFERENCES auth.users(id) NOT NULL,
     title text NOT NULL,
     url text NOT NULL,
     folder_id uuid REFERENCES folders(id),
     is_pinned boolean DEFAULT false,
     created_at timestamptz DEFAULT now()
   );

   -- Folders table
   CREATE TABLE folders (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id uuid REFERENCES auth.users(id) NOT NULL,
     name text NOT NULL,
     created_at timestamptz DEFAULT now()
   );

   -- Enable Row Level Security
   ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
   ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

   -- RLS Policies
   CREATE POLICY "Users can view own bookmarks" ON bookmarks FOR SELECT USING (auth.uid() = user_id);
   CREATE POLICY "Users can insert own bookmarks" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
   CREATE POLICY "Users can update own bookmarks" ON bookmarks FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
   CREATE POLICY "Users can delete own bookmarks" ON bookmarks FOR DELETE USING (auth.uid() = user_id);

   CREATE POLICY "Users can view own folders" ON folders FOR SELECT USING (auth.uid() = user_id);
   CREATE POLICY "Users can insert own folders" ON folders FOR INSERT WITH CHECK (auth.uid() = user_id);
   CREATE POLICY "Users can delete own folders" ON folders FOR DELETE USING (auth.uid() = user_id);

   -- Enable Realtime
   ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;
   ```

5. **Run the app**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

---

## 🧩 Problems I Ran Into & Solutions

### 1. Supabase Realtime not syncing across tabs
**Problem:** After adding the Supabase Realtime subscription, changes from one tab weren't showing in another. The `selectedFolder` state inside the realtime callback was stale (always the initial value due to closure).

**Solution:** Used a `useRef` to track the current `selectedFolder` value, and referenced `selectedFolderRef.current` inside the Realtime callback. This ensures the callback always sees the latest folder filter.

### 2. Tailwind CSS v4 configuration conflicts
**Problem:** The project was initialized with Tailwind v4 (using `@import "tailwindcss"` and `@tailwindcss/postcss`) but I accidentally added v3-style `@tailwind base/components/utilities` directives and a `tailwind.config.js`, which caused styling to break.

**Solution:** Removed the `tailwind.config.js` file and used Tailwind v4's CSS-native configuration with `@theme inline` blocks for design tokens. This eliminated the conflict.

### 3. Google OAuth redirect URL mismatch in production
**Problem:** The Google OAuth redirect was hardcoded to `http://localhost:3000/auth/callback`, so login failed after deploying to Vercel.

**Solution:** Replaced the hardcoded URL with `process.env.NEXT_PUBLIC_SITE_URL` and set the environment variable to the Vercel domain in production. Also added the production callback URL to Supabase's allowed redirect URLs.

### 4. Silent Supabase insert failures (RLS policies)
**Problem:** Creating folders and bookmarks appeared to succeed (no errors), but data never appeared. The Supabase client doesn't throw errors for RLS violations — it returns empty results silently.

**Solution:** Added proper error handling to all Supabase operations, returning `{ data, error }` and checking the error object. Also ensured RLS policies were correctly set for INSERT, SELECT, UPDATE, and DELETE operations on both tables.

### 5. Folder deletion leaving orphaned bookmarks
**Problem:** When deleting a folder, bookmarks that belonged to that folder still had the old `folder_id`, making them invisible in the "All" view (since they pointed to a non-existent folder).

**Solution:** Before deleting a folder, the app first sets `folder_id = null` on all bookmarks in that folder, moving them back to the "All" category.

---

## 📁 Project Structure

```
smart-bookmark-app/
├── app/
│   ├── auth/callback/
│   │   └── route.ts          # OAuth callback handler
│   ├── globals.css            # Design system & animations
│   ├── layout.tsx             # Root layout with metadata
│   └── page.tsx               # Main app (auth + bookmarks)
├── lib/
│   └── supabase.ts            # Supabase client
├── .env.local                 # Environment variables
└── package.json
```

---

## 📄 License

MIT
