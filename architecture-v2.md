# 📐 FinCake App – Architecture (MVP No-Login)

## 1. Tech Stack
- **Frontend**: Expo (React Native) hoặc Next.js.  
- **Backend**: Supabase (chỉ dùng cho news & clustering).  
- **State Management**: React Query (news từ server), Zustand (UI state, chat state).  
- **Storage cá nhân**: AsyncStorage (Expo) hoặc LocalStorage (web).  
- **Styling**: Tailwind/nativewind.  
- **AI Service**: OpenAI/LLM (trả lời Q&A, clustering news).  
- **Crawler**: Cron job / Edge Function → lấy tin CafeF + VNExpress → clustering → lưu vào Supabase.  

---

## 2. App Flow
- **Tab FinCake AI**
  - User nhập câu hỏi → gọi `/api/chat`.  
  - API lấy tin tức liên quan từ `news_clusters` + `news`.  
  - Gửi context đến AI → trả lời.  
  - Chat logs chỉ lưu local (AsyncStorage).  

- **Tab Thị trường**
  - Lấy tin tức từ Supabase (`news_clusters`).  
  - Hiển thị mỗi cluster = 1 **NewsClusterCard**.  
  - Portfolio editor (inline) → lưu danh mục trong AsyncStorage.  
  - Có nút “Hỏi AI” từ cluster hoặc từ portfolio.  

---

## 3. File & Folder Structure

```plaintext
src/
├── screens/
│   ├── FinAIScreen.tsx       # chat với AI
│   └── ThiTruongScreen.tsx   # tin tức theo cluster + portfolio editor
│
├── components/
│   ├── NewsClusterCard.tsx   # hiển thị 1 chủ đề + danh sách bài báo con
│   ├── ArticleItem.tsx       # item cho mỗi bài báo con
│   ├── Portfolio.tsx         # editor danh mục cổ phiếu
│   └── ChatBox.tsx           # nhập tin nhắn AI
│
├── hooks/
│   ├── useNewsClusters.ts    # fetch cluster từ API
│   ├── usePortfolio.ts       # CRUD portfolio (AsyncStorage)
│   └── useChat.ts            # chat với AI, lưu local
│
├── state/
│   ├── uiStore.ts            # UI state
│   ├── chatStore.ts          # trạng thái chat trong session
│   └── portfolioStore.ts     # sync với AsyncStorage
│
├── lib/
│   ├── supabaseClient.ts     # kết nối Supabase (chỉ dùng cho news)
│   ├── api.ts                # wrapper fetch API
│   └── utils.ts              # helper format currency, date
```

---

## 4. Database Schema (Supabase)

### `news_clusters`
```sql
id (uuid, pk)
topic (text)            
summary (text)          
created_at (timestamp)
```

### `news`
```sql
id (uuid, pk)
cluster_id (uuid, fk -> news_clusters.id)
title (text)
summary (text)
source_url (text)
source (text)           
published_at (timestamp)
```

👉 Không còn bảng `users`, `portfolios`, `chat_logs`.  
👉 Dữ liệu user cá nhân → **chỉ lưu local**.

---

## 5. State & Storage
- **React Query**: fetch `news_clusters` + join `news`.  
- **Zustand**: quản lý UI state (active tab, filter).  
- **AsyncStorage**:  
  - `portfolio`: danh mục đầu tư (mã CP, số lượng, giá vốn).  
  - `chatLogs`: lịch sử chat AI.  

---

## 6. Services & Connections
- **Frontend (Expo)**: hiển thị UI + gọi API.  
- **Supabase**: chỉ lưu **tin tức chung** (clusters + bài báo).  
- **AI Service**: trả lời câu hỏi, có thể dùng cluster_id để lấy context.  
- **Crawler/ETL**: định kỳ fetch tin CafeF, VNExpress → clustering → insert Supabase.  

---

## 7. Data Flow Example

### Người dùng mở **Thị trường**
1. `useNewsClusters` gọi `/api/news-clusters`.  
2. Supabase trả danh sách cluster + các bài báo con.  
3. App render `NewsClusterCard`.  
4. Portfolio editor load từ AsyncStorage → hiển thị danh mục cá nhân.

### Người dùng chat với AI
1. User nhập câu hỏi → `useChat.sendMessage`.  
2. API `/api/chat` lấy news cluster liên quan (không phụ thuộc user_id).  
3. AI trả lời → hiển thị ra màn hình.  
4. Log được lưu vào AsyncStorage (`chatLogs`).  

---

## 8. Ưu điểm (No-Login MVP)
- Trải nghiệm **zero friction**: mở app → dùng ngay.  
- Triển khai cực nhanh vì không cần Auth/RLS.  
- Dữ liệu chung (news) vẫn tập trung, có thể dùng cho nhiều người.  
- Portfolio/chat lưu local → không tốn backend.  

❌ Nhược điểm:  
- User đổi thiết bị/xóa app = mất dữ liệu.  
- Không có cá nhân hóa mạnh (trừ local).  
- Không thể phân tích hành vi chi tiết theo user.  

---

✅ Đây là bản kiến trúc MVP **No-Login / No-UserID**: nhanh gọn, tập trung vào trải nghiệm AI + News clustering.  
