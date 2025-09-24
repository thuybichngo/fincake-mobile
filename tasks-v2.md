# FinCake (MVP No-Login) — Step-by-Step Build Plan

## Phase 0 — Project Bootstrap (Expo)

**T-00. Init Expo app (TS)**
- **Do:** `npx create-expo-app fincake --template`
- **End:** Bare Expo TS app boots.
- **Verify:** `npx expo start` → open in Expo Go; default screen shows.

**T-01. Install core deps**
- **Do:**  
  `npm i @tanstack/react-query zustand @react-native-async-storage/async-storage nativewind`  
  `npm i @supabase/supabase-js`  
  `npx expo install react-native-safe-area-context react-native-screens`
- **End:** Packages installed; no type errors.
- **Verify:** `npx expo doctor` passes.

**T-02. Setup NativeWind**
- **Do:** Add `nativewind` config, Tailwind preset, create `styles/tailwind.css`.
- **End:** Utility classes usable in RN.
- **Verify:** Apply `className="text-red-500"` shows red text.

**T-03. Add React Navigation (Bottom Tabs)**
- **Do:**  
  `npm i @react-navigation/native @react-navigation/bottom-tabs`  
  `npx expo install react-native-gesture-handler react-native-reanimated`
- **End:** Navigation available.
- **Verify:** Create minimal 2-tab navigator → tabs switch.

---

## Phase 1 — App Shell & Navigation

**T-04. Create `navigation/BottomTabs.tsx`**
- **Do:** Tabs: **FinCake AI** and **Thị trường**.
- **End:** Navigator exported & used in `App.tsx`.
- **Verify:** Switching tabs keeps each screen’s local state.

**T-05. Vietnamese copy baseline**
- **Do:** Centralize VN strings (constants file).
- **End:** All tab labels/subtitles in Vietnamese.
- **Verify:** No English labels on visible screens.

---

## Phase 2 — State & Storage (No-Login)

**T-06. React Query Provider**
- **Do:** Wrap app with `QueryClientProvider`.
- **End:** Server state cache available.
- **Verify:** Dummy `useQuery` returns “ok”.

**T-07. Zustand stores (skeleton)**
- **Do:** `state/uiStore.ts`, `state/portfolioStore.ts`, `state/chatStore.ts` with minimal initial state.
- **End:** Hooks return default values; setters update.
- **Verify:** Toggle a boolean in a test component.

**T-08. AsyncStorage helpers**
- **Do:** `lib/storage.ts` with `getItem`, `setItem`, namespaced keys.
- **End:** Wrapper functions ready.
- **Verify:** Write/read a demo key.

---

## Phase 3 — Supabase (News Only)

**T-09. Create Supabase project & keys**
- **Do:** Create project; obtain URL + anon key.
- **End:** Keys ready; add to `.env`.
- **Verify:** Logged values in dev (then remove logs).

**T-10. Init client**
- **Do:** `lib/supabaseClient.ts` (singleton).
- **End:** Client importable on RN.
- **Verify:** `await supabase.from('_').select()` (dummy) returns error, not crash.

**T-11. Create tables**
- **Do:** SQL for:
  - `news_clusters(id uuid pk, topic text, summary text, created_at timestamptz)`
  - `news(id uuid pk, cluster_id uuid fk, title text, summary text, source_url text, source text, published_at timestamptz)`
- **End:** Tables exist.
- **Verify:** Insert 1 cluster + 2 news rows manually; foreign key OK.

**T-12. Read policy (public read)**
- **Do:** Enable RLS; add policy: allow `select` to `anon` for `news_clusters` & `news`.
- **End:** Mobile can read without auth.
- **Verify:** Simple `select` from device returns rows.

**T-13. Seed sample data**
- **Do:** Insert 2 clusters, each 2–3 articles.
- **End:** Data visible.
- **Verify:** `select *` shows seeds.

---

## Phase 4 — News Fetch (Clusters)

**T-14. Hook `useNewsClusters`**
- **Do:** Query `news_clusters` (DESC by `created_at`) and join child `news` (second query by `cluster_id` or `rpc`).
- **End:** Returns: `[{cluster, articles: [...]}, ...]`.
- **Verify:** Console shows 2 clusters with articles.

**T-15. Pagination support**
- **Do:** Add `limit`/`offset` params to queries.
- **End:** Infinite load capability.
- **Verify:** Fetch first 1 cluster, then next.

**T-16. Error/empty states**
- **Do:** Hook exposes `isLoading`, `isError`, `isEmpty`.
- **End:** Consumers can render UI states.
- **Verify:** Temporarily disconnect network → error state appears.

---

## Phase 5 — Thị Trường UI

**T-17. `NewsClusterCard.tsx`**
- **Do:** Props: `topic`, `summary`, child `articles` list (title + source + link).
- **End:** Card renders per design.
- **Verify:** Renders seeded clusters.

**T-18. `ArticleItem.tsx`**
- **Do:** Tap → open `source_url` via `Linking.openURL`.
- **End:** Article list clickable.
- **Verify:** Tapping opens browser.

**T-19. `ThiTruongScreen.tsx`**
- **Do:** Compose list of `NewsClusterCard`; add header “Tin nhanh theo chủ đề”.
- **End:** Screen matches MVP.
- **Verify:** Pull-to-refresh reloads data.

**T-20. “Hỏi AI về chủ đề này” button**
- **Do:** In each card, button sets a prefill question with `cluster_id` in state.
- **End:** Navigates to **FinCake AI** with context.
- **Verify:** `FinAIScreen` input prefilled.

---

## Phase 6 — Portfolio (Local Only)

**T-21. Portfolio schema (local)**
- **Do:** Define type: `{symbol: string; shares: number; avgPrice: number}`.
- **End:** Shared type in `types/portfolio.ts`.
- **Verify:** Type checks in store.

**T-22. Portfolio store & persistence**
- **Do:** `portfolioStore` with `items`, `add`, `update`, `remove`; load/save via AsyncStorage.
- **End:** State persists across app restarts.
- **Verify:** Kill app → relaunch → items remain.

**T-23. `Portfolio.tsx` editor**
- **Do:** Inputs for `Mã CP`, `Số lượng`, `Giá vốn`; add/delete rows.
- **End:** Inline editor works.
- **Verify:** Add HPG → persists after restart.

**T-24. Validation**
- **Do:** Block negative numbers & empty symbol; VN messages.
- **End:** Invalid values can’t save.
- **Verify:** Enter `-3` shares → error toast.

**T-25. Filter clusters by portfolio (client-side)**
- **Do:** Toggle pill “Danh mục của tôi”; filter card list to clusters with any article mentioning symbols in portfolio titles.
- **End:** Cards narrow to relevant topics.
- **Verify:** Add HPG in portfolio → only HPG topics shown when pill active.

---

## Phase 7 — AI Chat (No-Login)

**T-26. Supabase Edge Function: `/chat` (basic)**
- **Do:** Create HTTP function that accepts `{message, cluster_id?}`; calls OpenAI with server-side key; returns JSON answer (non-stream for MVP).
- **End:** Secure chat endpoint deployed.
- **Verify:** `curl` returns VN answer for “HPG là gì?”.

**T-27. Context building (cluster)**
- **Do:** If `cluster_id` provided, fetch its articles and include titles/summaries in prompt.
- **End:** AI receives clustered context.
- **Verify:** Ask about the cluster → answer references articles.

**T-28. `useChat` hook**
- **Do:** Manage `messages`, `send`, `isSending`; call edge function; handle errors.
- **End:** Hook returns assistant/user message arrays.
- **Verify:** Send returns assistant message string.

**T-29. `ChatBox.tsx` + `FinAIScreen.tsx`**
- **Do:** Textarea + send button; render message bubbles (user/assistant).
- **End:** Screen matches MVP.
- **Verify:** One Q&A cycle works end-to-end.

**T-30. Prefill from Thị Trường**
- **Do:** If prefill exists, set input on mount; include `cluster_id`.
- **End:** Cross-screen handoff works.
- **Verify:** Tap “Hỏi AI” on a card → input shows prefilled question.

**T-31. Save chat logs locally**
- **Do:** Append last 10 conversations to AsyncStorage (`chatLogs`).
- **End:** Logs restore on reopen.
- **Verify:** Restart app → last chats listed.

---

## Phase 8 — News Ingestion (MVP Path)

**T-32. Supabase Edge Function: `/ingest-news-preclustered`**
- **Do:** Accept JSON: `[ {topic, summary, articles:[{title,summary,source,source_url,published_at}]} ]`; upsert cluster + articles.
- **End:** One-shot ingestion endpoint.
- **Verify:** Post 2 clusters → app shows them.

**T-33. Admin JSON sample**
- **Do:** Create `samples/ingest.json` with 2 clusters × 2 articles.
- **End:** Example data ready.
- **Verify:** Posting the JSON updates DB.

---

## Phase 9 — Polish & UX Guards

**T-34. Loaders & skeletons**
- **Do:** Shimmer placeholders for cluster list & chat send.
- **End:** No jarring flickers.
- **Verify:** Simulate slow 3G → skeletons appear.

**T-35. Offline fallback (read)**
- **Do:** Cache last fetched clusters in AsyncStorage; if offline, show cached list with banner “Ngoại tuyến”.
- **End:** Readable offline.
- **Verify:** Airplane mode → cached list shows.

**T-36. Link safety**
- **Do:** Guard `Linking.openURL` with try/catch; show toast on failure.
- **End:** No crashes on bad URL.
- **Verify:** Tap malformed URL → toast error.

**T-37. VN copy pass**
- **Do:** Review all strings for tone and clarity.
- **End:** Consistent Vietnamese.
- **Verify:** No English leftovers.

---

## Phase 10 — QA & Delivery

**T-38. Manual QA checklist (markdown)**
- **Do:** Create `QA.md` with steps: open tabs, seed news, filter, chat, prefill, persistence.
- **End:** Checklist saved in repo.
- **Verify:** Run once and tick all.

**T-39. Minimal error logging**
- **Do:** Console log boundaries in hooks; add global error boundary screen.
- **End:** Failures are visible, not silent.
- **Verify:** Force network error → boundary visible.

**T-40. Build artifacts for testers**
- **Do:** Create Expo dev client (optional) or share Expo Go QR; document env variables.
- **End:** Testers can run on devices.
- **Verify:** Another device opens app successfully.

---

## Optional (Nice-to-Have) After MVP

**T-41. Streaming replies**
- **Do:** Upgrade `/chat` to stream tokens; adapt hook to append chunks.
- **End:** Typewriter-style answers.
- **Verify:** Long reply arrives progressively.

**T-42. Cluster search**
- **Do:** Client-side search over `topic`/article titles.
- **End:** Results narrow as you type.
- **Verify:** Typing “HPG” filters instantly.

**T-43. Portfolio-aware AI**
- **Do:** Include local portfolio snapshot in chat prompt when user asks about a symbol they hold.
- **End:** Personalized context (still local).
- **Verify:** AI mentions user’s average price.

---

## Definition of Done (copy/paste with each task)

- **UI/Component DoD**
  - [ ] Renders with no warnings/errors.
  - [ ] Works on 375×812 (iPhone X) and 360×800 (Android).
  - [ ] Handles loading/empty/error states.
  - [ ] Vietnamese copy finalized.

- **Hook/API DoD**
  - [ ] Happy path returns expected shape.
  - [ ] Error path surfaced to UI (message/toast).
  - [ ] One manual test via console or curl.

- **Persistence DoD**
  - [ ] Data written and read back.
  - [ ] Survives app restart.
  - [ ] Invalid data is rejected.

---

## Milestone Checkpoints

- **A:** Tabs + styling + stores (T-00 → T-08)
- **B:** Clusters fetched & rendered (T-14 → T-19)
- **C:** Portfolio local CRUD + filter (T-21 → T-25)
- **D:** AI chat end-to-end + prefill (T-26 → T-31)
- **E:** Ingestion path live (T-32 → T-33)
- **F:** Polish + QA pass (T-34 → T-40)
