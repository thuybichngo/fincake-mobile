# FinCake MVP – Step-by-Step Build Plan

## Phase 0 — Project Bootstrap

**T-00. Create repo & Next.js app**
- **Do:** `npx create-next-app@latest fincake --ts --eslint --app`
- **End:** Repo with initial Next.js app, runs locally.
- **Verify:** `pnpm dev` (or `npm/yarn`) → home page renders at `http://localhost:3000`.

**T-01. Add TailwindCSS**
- **Do:** Install Tailwind, init config, add `globals.css` with Tailwind directives.
- **End:** Tailwind working.
- **Verify:** Put `className="text-green-600"` on a div → text shows green.

**T-02. Install core libraries**
- **Do:** Install `@supabase/supabase-js`, `zustand`, `@tanstack/react-query`, `zod`, `date-fns`.
- **End:** Packages available; no type errors.
- **Verify:** `pnpm build` passes.

**T-03. Configure basic project scripts**
- **Do:** Add `lint`, `typecheck`, `format`, `build`, `dev` scripts.
- **End:** Scripts run successfully.
- **Verify:** `pnpm typecheck` has no errors.

---

## Phase 1 — Supabase Setup

**T-04. Create Supabase project**
- **Do:** Create project in Supabase dashboard.
- **End:** Project URL, anon/public & service keys available.
- **Verify:** Keys visible in dashboard.

**T-05. Add environment variables**
- **Do:** Create `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `OPENAI_API_KEY`.
- **End:** App can read env vars.
- **Verify:** `console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)` shows value in server logs (temporarily).

**T-06. Initialize Supabase client**
- **Do:** Create `lib/supabaseClient.ts`.
- **End:** Exported browser/client + server client helpers.
- **Verify:** Import and call `supabase.from('_').select()` (dummy) without crash.

---

## Phase 2 — Database Schema

**T-07. Create `users` table**
- **Do:** SQL from architecture (`users: id, email, created_at`).
- **End:** Table exists.
- **Verify:** Insert a fake row manually; select returns row.

**T-08. Create `portfolios` table**
- **Do:** SQL (`id, user_id, symbol, shares, avg_price, created_at`).
- **End:** Table exists with foreign key to `users`.
- **Verify:** Insert sample portfolio row; FK enforced.

**T-09. Create `news` table**
- **Do:** SQL (`id, symbol, title, summary, source_url, source, published_at`).
- **End:** Table exists + RLS policies to allow read-only for authenticated users.
- **Verify:** Select works from SQL editor; anonymous read is blocked if intended.

**T-10. Create `chat_logs` table**
- **Do:** SQL (`id, user_id, query, response, created_at`) + RLS per-user.
- **End:** Table exists.
- **Verify:** Test insert/select via SQL editor.

**T-11. Seed minimal data**
- **Do:** Add 3–5 `news` rows for symbols (e.g., HPG, VNM) with CafeF/VNExpress URLs.
- **End:** Seed present.
- **Verify:** `select * from news` returns rows.

---

## Phase 3 — Auth (Email Magic Link for MVP)

**T-12. Enable email auth**
- **Do:** Turn on Email (magic link) in Supabase Auth; set site URL.
- **End:** Auth provider enabled.
- **Verify:** Test sending magic link to your email.

**T-13. Client auth helper**
- **Do:** Create `lib/auth.ts` (signInWithOtp, signOut, getSession).
- **End:** Exported functions callable from components.
- **Verify:** `await signInWithOtp('your@email')` succeeds (check email).

**T-14. Minimal auth UI**
- **Do:** Add “Đăng nhập” button in header; render email input modal.
- **End:** Can trigger OTP sign-in.
- **Verify:** After login, “Xin chào, {email}” shows.

---

## Phase 4 — App Shell & Tabs (Vietnamese UI)

**T-15. Root layout & fonts**
- **Do:** Implement `app/layout.tsx` with Vietnamese font + base styles.
- **End:** Global styles applied.
- **Verify:** Body text uses chosen font.

**T-16. Bottom Tabs scaffold**
- **Do:** Create persistent bottom tab bar with 2 routes: `/fin-ai`, `/thi-truong`.
- **End:** Tabs navigate without reload; active tab highlighted.
- **Verify:** Clicking tabs switches routes and preserves state per route (basic).

**T-17. Redirect index to FinCake AI**
- **Do:** `app/page.tsx` redirects to `/fin-ai`.
- **End:** Visiting `/` lands on FinCake AI.
- **Verify:** Browser redirect works.

---

## Phase 5 — State & Data Layer

**T-18. React Query Provider**
- **Do:** Add `QueryClientProvider` in root layout.
- **End:** Server state cache available.
- **Verify:** Simple `useQuery` demo fetch works.

**T-19. Zustand stores**
- **Do:** Create `state/uiStore.ts`, `state/portfolioStore.ts`, `state/chatStore.ts` with minimal types.
- **End:** Stores export hooks and initial state.
- **Verify:** Components can read/write store values.

**T-20. API helper**
- **Do:** `lib/api.ts` with `jsonFetcher`, error handling, `zod` parse helpers.
- **End:** Shared fetch wrapper.
- **Verify:** Call wrapper against `/api/health` (create a tiny route).

**T-21. Types**
- **Do:** Add `types/news.ts`, `types/portfolio.ts`, `types/chat.ts` as per architecture.
- **End:** Types compile and used in hooks/components.
- **Verify:** `tsc` passes.

---

## Phase 6 — “Thị trường” Tab (News)

**T-22. `/api/news` route**
- **Do:** Implement server route: paginated list ordered by `published_at desc`, optional `symbol`.
- **End:** JSON response with 10 items/page.
- **Verify:** `GET /api/news` returns seeded items.

**T-23. `useNews` hook**
- **Do:** Create `app/thi-truong/hooks/useNews.ts` using React Query + pagination.
- **End:** Hook returns list, loading, error, `fetchNextPage`.
- **Verify:** Console shows correct item counts per page.

**T-24. `NewsCard` component**
- **Do:** Render title, summary, source favicon (static), timeago, link.
- **End:** Looks like wireframe; responsive.
- **Verify:** Cards render seed items; link opens source in new tab.

**T-25. News feed screen**
- **Do:** `app/thi-truong/page.tsx` renders header “Tin nhanh thị trường”, tabs (Phổ biến / Theo danh mục / Từ chuyên gia – static for now) and infinite list.
- **End:** Scroll loads more.
- **Verify:** Scrolling fetches next page.

**T-26. “Hỏi AI” affordance from news**
- **Do:** Each `NewsCard` has a “Hỏi AI” button pre-filling question like “Tại sao giá cổ phiếu {symbol}…?”
- **End:** Click navigates to `/fin-ai` with preset query in state.
- **Verify:** Opening `/fin-ai` shows input prefilled.

---

## Phase 7 — Portfolio Editor (Inline, MVP)

**T-27. `/api/portfolio` routes (CRUD)**
- **Do:** Implement `GET (list)`, `POST (create)`, `PATCH (update)`, `DELETE`.
- **End:** Authenticated, row-level filtering by `user_id`.
- **Verify:** Postman tests for all verbs succeed.

**T-28. `Portfolio` component (UI)**
- **Do:** Table with rows: `Mã CP`, `Số lượng`, `Giá vốn`, actions (add, delete).
- **End:** Matches wireframe inline editor.
- **Verify:** Can add/edit/delete locally (not yet synced).

**T-29. Hook `usePortfolio`**
- **Do:** React Query + optimistic updates; sync to Supabase via API.
- **End:** Returns list & mutations.
- **Verify:** Add/edit/delete persists on refresh.

**T-30. Empty state & validation**
- **Do:** Zod validate symbol, positive numbers; show VN error messages.
- **End:** UX blocks invalid input.
- **Verify:** Enter `-5` shares → error shown, no save.

**T-31. Filter news by portfolio**
- **Do:** In “Thị trường”, add quick filter pill: “Danh mục của tôi” to show news where `symbol` in user portfolio.
- **End:** Toggling pill filters list.
- **Verify:** With HPG in portfolio, news shows HPG items when pill active.

---

## Phase 8 — FinCake AI (Chat)

**T-32. `/api/chat` route (skeleton)**
- **Do:** Accept `{message, context?}`; return static mock response.
- **End:** Endpoint returns `{answer: "Xin chào…"}`.
- **Verify:** Curl returns JSON 200.

**T-33. LLM integration**
- **Do:** In `/api/chat`, call OpenAI (or chosen LLM) with system prompt (Vietnamese), include recent news for symbol if detected (simple regex).
- **End:** Real model response.
- **Verify:** Asking about HPG yields coherent VN text.

**T-34. Streaming responses**
- **Do:** Switch to streaming (edge runtime/SSE) for token-by-token output.
- **End:** Route streams chunks.
- **Verify:** Curl with `--no-buffer` shows streamed data.

**T-35. `useChat` hook**
- **Do:** Manages messages list, send, receive stream; error handling; abort controller.
- **End:** Hook returns `{messages, send, isStreaming}`.
- **Verify:** Sending message appends assistant chunks progressively.

**T-36. Chat UI**
- **Do:** `Message` bubbles (user/assistant), `ChatBox` with textarea + send.
- **End:** Matches wireframe; VN placeholders.
- **Verify:** Can send message, see streamed answer.

**T-37. Prefill from “Thị trường”**
- **Do:** If state contains `prefillQuestion`, set ChatBox value on mount.
- **End:** Deep-link works.
- **Verify:** Clicking “Hỏi AI” from News fills input.

**T-38. Log conversations**
- **Do:** After assistant finishes, store `{user_id, query, response}` in `chat_logs`.
- **End:** Row inserted per interaction.
- **Verify:** Table shows new rows.

**T-39. Quick suggestions (chips)**
- **Do:** Static 3 chips under ChatBox (e.g., “Có nên mua HPG bây giờ không?”, “Cổ phiếu nào đang…?”, “Dự báo 30 ngày tới?”).
- **End:** Tapping chip sets input.
- **Verify:** Clicking populates textarea.

---

## Phase 9 — News Ingestion (MVP path)

> For MVP, we can use a simple edge function + manual trigger. (Automated crawling can come later.)

**T-40. Create Supabase Edge Function `ingest-news`**
- **Do:** Function accepts JSON array of articles; upserts into `news`.
- **End:** Deployed function URL.
- **Verify:** Calling with 2 items inserts rows.

**T-41. Admin upload page (internal)**
- **Do:** `/admin/ingest` page (protected) with textarea → POST to edge function.
- **End:** Can paste JSON from CafeF/VNExpress exports.
- **Verify:** Paste 2 articles → appear in app.

---

## Phase 10 — Polish & Cross-linking

**T-42. Stock symbol detection**
- **Do:** In news card, render `symbol` chip; clicking opens AI with “Tại sao giá {symbol}…?”.
- **End:** UX shortcut implemented.
- **Verify:** Click chip → chat prefilled.

**T-43. Loading/empty/error states**
- **Do:** Add skeleton loaders, “Không có dữ liệu”, and retry buttons.
- **End:** All states covered.
- **Verify:** Turn off network → error states show.

**T-44. VN copy review**
- **Do:** Audit all labels/messages → ensure Vietnamese tone consistent.
- **End:** Glossary doc + applied changes.
- **Verify:** No English leftovers in UI.
