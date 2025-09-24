# 📐 FinCake App – Full Architecture

## 1. Tech Stack
- **Frontend**: Next.js (React framework, supports SSR/ISR for SEO + performance).
- **Backend**: Supabase (Postgres DB, Auth, Storage, Realtime, Edge Functions).
- **State Management**: React Query (for server state) + Context API/Zustand (for client state).
- **UI**: TailwindCSS (for fast styling, responsive design).
- **Language**: Vietnamese (UI copy).
- **News Sources**: CafeF, VNExpress (scraped/aggregated → stored in Supabase → displayed).

---

## 2. App Flow
- **Tab 1: FinCake AI**
  - Chat interface with AI (company insights, valuation, analysis).
  - Query OpenAI/LLM API → call Supabase DB for company data → return structured answer.
- **Tab 2: Thị trường**
  - News feed from CafeF/VNExpress (daily highlights).
  - Inline portfolio editor for user input (saved in Supabase).
  - User can tap stock symbol → see AI summary.

---

## 3. File & Folder Structure

```plaintext
fincake-app/
│── app/                      # Next.js App Router
│   ├── layout.tsx            # Root layout (global navbar, bottom tabs)
│   ├── page.tsx              # Default redirect -> /fin-ai
│   │
│   ├── fin-ai/               # FinCake AI Tab
│   │   ├── page.tsx          # Chat screen UI
│   │   ├── components/
│   │   │   ├── ChatBox.tsx   # User input + send
│   │   │   ├── Message.tsx   # Chat bubble
│   │   │   └── Loader.tsx    # Typing indicator
│   │   └── hooks/
│   │       └── useChat.ts    # Handles AI calls, streaming responses
│   │
│   ├── thi-truong/           # Thị trường Tab
│   │   ├── page.tsx          # News feed UI + Portfolio editor
│   │   ├── components/
│   │   │   ├── NewsCard.tsx  # Displays CafeF/VNExpress snippet
│   │   │   ├── Portfolio.tsx # Inline portfolio editor
│   │   │   └── StockCard.tsx # Inline stock highlight
│   │   └── hooks/
│   │       └── useNews.ts    # Fetches + caches market news
│   │
│   └── api/                  # Next.js API routes (serverless)
│       ├── chat/route.ts     # Proxy → OpenAI/LLM + Supabase
│       ├── news/route.ts     # Fetch aggregated news from DB
│       └── stocks/route.ts   # Query Supabase for stock data
│
│── lib/
│   ├── supabaseClient.ts     # Supabase client init
│   ├── api.ts                # API call helpers (fetcher for React Query)
│   └── utils.ts              # Shared helpers (format currency, dates)
│
│── state/
│   ├── uiStore.ts            # UI states (active tab, modals)
│   ├── portfolioStore.ts     # Portfolio state (local + Supabase sync)
│   └── chatStore.ts          # Chat state (streaming messages)
│
│── styles/
│   ├── globals.css           # Global Tailwind setup
│   └── theme.css             # Colors, typography
│
│── types/
│   ├── chat.ts               # Message, AIResponse, UserQuery
│   ├── news.ts               # NewsArticle, Source
│   └── portfolio.ts          # Stock, Portfolio
│
│── supabase/
│   ├── schema.sql            # DB schema (users, portfolios, news, chat logs)
│   └── seed.sql              # Demo data
│
│── package.json
│── tsconfig.json
│── tailwind.config.js
```

---

## 4. Database Schema (Supabase)

### `users`
```sql
id (uuid, pk)
email (text, unique)
created_at (timestamp)
```

### `portfolios`
```sql
id (uuid, pk)
user_id (uuid, fk -> users.id)
symbol (text)      -- e.g. HPG, VNM
shares (int)
avg_price (float)
created_at (timestamp)
```

### `news`
```sql
id (uuid, pk)
symbol (text)       -- mapped ticker
title (text)
summary (text)
source_url (text)
source (text)       -- CafeF / VNExpress
published_at (timestamp)
```

### `chat_logs`
```sql
id (uuid, pk)
user_id (uuid, fk -> users.id)
query (text)
response (jsonb)
created_at (timestamp)
```

---

## 5. State Management

- **Server State**: React Query (`useQuery`, `useMutation`)  
  - Fetch portfolio, news, chat history.
  - Cache per session for offline support.
- **Client State**: Zustand (lightweight)  
  - Active tab, UI filters (phổ biến / theo danh mục / từ chuyên gia).
  - Temporary draft portfolio changes.

---

## 6. Services & Connections

- **Frontend (Next.js)**  
  - UI (Tabs, Chat, News).
  - Calls API routes for secure access.
- **Supabase**  
  - Auth: email login.
  - DB: users, portfolios, news, chat logs.
  - Storage: (future) stock images or AI report PDFs.
- **AI Service (OpenAI or local LLM)**  
  - Query analysis, valuation Q&A.
  - Wrapped in `/api/chat/route.ts`.
- **News Aggregator**  
  - Cron job (Supabase Edge Function) pulls news from CafeF/VNExpress → stores in `news`.

---

## 7. Data Flow Example

1. User opens **Thị trường tab**  
   → `useNews.ts` calls `/api/news` → Supabase → returns articles.  

2. User edits **portfolio**  
   → `portfolioStore.ts` updates local state → sync with Supabase `portfolios`.  

3. User asks **FinCake AI**: "Có nên mua HPG bây giờ không?"  
   → `/api/chat` → AI + Supabase (get HPG fundamentals + news) → returns summarized answer.

---

✅ This gives you a **clear Next.js + Supabase architecture** with Vietnamese UI, minimal navigation, and AI + news aggregation built-in.
