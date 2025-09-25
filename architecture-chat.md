# Kien trúc chat FinCake AI (gọi sang BE tự build, không dùng OpenAI trực tiếp)
## Tổng quan
- *Client:* Ứng dụng React Native (Expo) trong fincake-mobile sẽ gọi trực tiếp BE fin-cake-be qua HTTP SSE cho tính năng chat.
- *Backend:* Dự án fin-cake-be (FastAPI + LangGraph/LangChain), stream phản hồi theo chuẩn Server-Sent Events (SSE), điều phối multi-agent và tool.
- *Data:* Lưu trữ hội thoại/agent/financial reports trong DB qua SQLModel + Alembic. Trạng thái UI ở client lưu bằng Zustand + AsyncStorage.
## Cấu trúc thư mục
### Mobile app (Expo) — fincake-mobile/ (liên quan tới chat)
- src/components/
    - ChatBox.tsx: UI nhập câu hỏi, bấm gửi.
- src/hooks/
    - useChat.ts: Logic gửi câu hỏi, quản lý lỗi/loading, đồng bộ chatStorage.
- src/state/
    - chatStore.ts: Zustand store (messages, isSending, prefill).
- src/lib/
    - storage.ts: AsyncStorage tiện ích cho chatStorage.
    - supabaseClient.ts: Supabase client cho các phần dữ liệu khác (không dùng cho chat nữa).
- Lưu ý: Trước đây gọi Supabase Edge Function /chat và trả về JSON. Khi tích hợp BE, chuyển sang gọi endpoint SSE của fin-cake-be.
### Backend — fin-cake-be/backend/
- app/main.py: Khởi tạo FastAPI, cấu hình CORS, mount router.
- app/api/router.py: Router gốc, include chat và agents, có GET /health.
- app/api/routes/chat.py:
    - GET /chat: chào mừng.
    - POST /chat: endpoint stream SSE. Nhận danh sách messages (user/assistant) và trả stream events.
- app/services/chat_service.py:
    - Tạo các agent từ DB (đọc bảng agent), ráp toolset theo cấu hình.
    - Khởi tạo supervisor (LangGraph) để điều phối agents, stream event: STATUS, MESSAGE (chunk), FOLLOW_UP, DONE, ERROR.
- app/llms/llms.py: Factory chọn model LLM (OpenAI) theo env (về lâu dài có thể thay bằng model nội bộ).
app/core/:
    - settings.py: cấu hình từ env (DATABASE_URL, ADMIN_USER/PASSWORD, và hiện có OPENAI_API_KEY).
    - db.py: engine + session (SQLModel/SQLAlchemy), DI SessionDep.
    - auth.py: Basic Auth cho admin route.
    - logger.py: logging.
- app/models/:
    - conversation.py: Conversation(title, meta JSONB).
    - message.py: Message(conversation_id, index, role, content, meta, token, model).
    - agent.py, financial_report.py, base.py: entity & base model.
- app/schemas/:
    - chat.py: schema request/response event (SSE payload), ChatCreate, ChatEvent, ChatEventType.
    - agent.py: schema cho agent.
- app/agents/:
    - supervisor.py, agent_financial_analysis.py: lời nhắc/prompt, cấu hình hành vi agent.
- app/tools/:
    - tools.py: hợp nhất tool (date/finance/metrics/stocks/math, follow up).
    - Các file cụ thể: date_tools.py, finance_tools.py, financial_metric_tools.py, stock_tools.py, math_tools.py.
- alembic/ (+ alembic.ini): migration cho agents, conversations/messages, financial reports.
- data/: script crawl báo cáo tài chính.
### Web UI (tuỳ chọn) — fin-cake-be/web/
- React + Vite để test UI chat và admin agents; không bắt buộc với mobile.
## Chức năng của từng phần
### Mobile
- ChatBox.tsx: nhập/gửi câu hỏi; hiển thị trạng thái gửi/lỗi.
- useChat.ts:
    - Hydrate logs từ chatStorage.
    - Gửi payload lên BE (sang SSE) và cập nhật store theo từng chunk.
    - Lưu lại 10 tin nhắn gần nhất.
- chatStore.ts: nguồn sự thật (messages, isSending, prefillQuestion/ClusterId).
### Backend
- POST /chat (SSE):
    - Nhận messages từ client (danh sách role/content).
    - Thêm SystemMessage về timezone từ header x-timezone.
    - Dùng ChatService.process_messages() để stream sự kiện:
        - STATUS: bắt đầu/đang dùng tool/hoàn thành tool.
        - MESSAGE: từng chunk nội dung trả lời.
        - FOLLOW_UP: gợi ý câu hỏi tiếp theo (nếu có).
        - DONE: kết thúc stream.
        - ERROR: lỗi hệ thống.
- ChatService:
    - Nạp agents từ DB (bảng agent), lắp tool theo config của agent.
    - Dựng supervisor (LangGraph) cho multi-agent (parallel tool calls, full history).
    - Stream events theo vòng đời xử lý.
- LLM:
    - get_llm(model_name): chọn model (mặc định gpt-4o-mini). Sau này có thể hoán đổi sang API nội bộ bạn đã build (thay adapter).
- DB:
    - Lưu conversation/message (thiết kế sẵn); có thể ghi log hội thoại để phân tích, tính token, audit.
## Trạng thái lưu ở đâu
### Client (mobile)
- Zustand:
    - messages: hội thoại hiện tại (user/assistant).
    - isSending: trạng thái gửi.
    - prefill*: tiền điền khi nhảy từ context (tin tức/cluster…).
- AsyncStorage:
    - chatStorage: nhớ 10 tin nhắn gần nhất để khôi phục sau restart.
- Server (BE)
    - Database qua SQLModel:
        - agent: danh sách agent, prompt, toolset, model… để supervisor sử dụng.
        - conversation/message: log hội thoại (nếu bật lưu).
        - financial_report: dữ liệu miền phục vụ tool tài chính.
- Config
    - .env của BE: DATABASE_URL, thông tin admin, khoá model (nếu cần). Có thể bổ sung AI_API_KEY/endpoint riêng nếu dùng engine nội bộ.
## Kết nối dịch vụ (luồng yêu cầu)
- *Bước 1:* Người dùng nhập câu hỏi trên app → ChatBox.tsx gọi useChat.send().
- *Bước 2:* useChat.send() xây messages (bao gồm lịch sử gần nhất) và gửi POST /chat đến BE với header x-timezone.
- *Bước 3:* BE chuẩn hoá thành System/Human/AI messages, thêm system timezone, tạo supervisor và bắt đầu stream SSE:
    - Gửi STATUS (“Đang xử lý…”).
    - Gửi các chunk MESSAGE theo token cho tới khi hoàn tất.
    - Có thể gửi thêm FOLLOW_UP (gợi ý) khi tool kết thúc.
    - Kết thúc bằng DONE.
- *Bước 4:* App nhận SSE, cập nhật chatStore.messages theo thời gian thực; lưu chatStorage (rolling 10).
- *Tuỳ chọn:*
    - BE ghi conversation/message vào DB để phục vụ phân tích/tiếp nối phiên sau.
## Hợp đồng API (gợi ý)
- Client → BE POST /chat (SSE):
    - Headers:
        - Content-Type: application/json
        - x-timezone: Asia/Ho_Chi_Minh (hoặc timezone client)
    - Body (ví dụ):
- BE → Client (SSE events):
    - Dạng data: { "type": "STATUS" | "MESSAGE" | "FOLLOW_UP" | "DONE" | "ERROR", "content": any }
    - MESSAGE: chunk text; client cộng dồn lại để hiển thị.
## Cấu hình và môi trường
### Mobile:
- EXPO_PUBLIC_FINCAKE_BE_URL: base URL của BE (vd: https://api.fin.cakestudy.com).
- Nếu chưa stream, có thể thêm fallback JSON (nhưng BE đã chuẩn SSE).
### BE:
- DATABASE_URL: ví dụ Postgres/SQLite.
- ADMIN_USER/ADMIN_PASSWORD: cho admin routes.
- Thay thế hoặc mở rộng OPENAI_API_KEY bằng khoá/endpoint của AI nội bộ (nếu dùng engine riêng), hoặc cài adapter trong llms.py.
## Bảo mật & quyền truy cập
- *CORS*: BE mở cho localhost và domain triển khai (fin.cakestudy.com, api.fin.cakestudy.com).
- *Admin*: Basic Auth cho endpoint quản trị (agents, v.v.). Tránh dùng anon cho route nhạy cảm.
- *Client secrets*: Không để lộ khoá server-side (giữ tại BE). Mobile chỉ gọi HTTP công khai.
## Khả năng mở rộng
- *Streaming nâng cao*: Chuẩn hoá event types thêm metadata (token usage, agent name).
- *Bộ nhớ hội thoại server-side*: Gắn conversation_id để resume phiên đa thiết bị.
- *Observability*: Log sự kiện/latency/tool calls; đếm token; tracing.
- *Tác vụ nền*: Hàng đợi cho job tốn thời gian (crawl, phân tích báo cáo).
- *Thay LLM*: Hoán đổi llms.py sang API model nội bộ hoặc gateway (giữ nguyên giao diện get_llm).
## Checklist tích hợp (Mobile → BE)
- Thêm env EXPO_PUBLIC_FINCAKE_BE_URL và trỏ useChat.ts sang POST {FINCAKE_BE_URL}/chat với SSE.
- Implement SSE client trên app:
    - Kết nối fetch + ReadableStream hoặc thư viện SSE cho React Native.
    - Ghép chunk MESSAGE, cập nhật UI theo thời gian thực; xử lý STATUS/FOLLOW_UP/DONE/ERROR.
- Giữ nguyên chatStore và chatStorage để đồng bộ trạng thái UI.
- Kiểm thử:
    - Timeout, reconnect, cancel (khi người dùng rời màn hình).
    - Lỗi mạng: chuyển isSending và hiển thị thông báo.
- Tài liệu hoá kiến trúc end-to-end, kết nối Expo với FastAPI SSE, vai trò DB (conversation/message/agent), và config env cần thiết.