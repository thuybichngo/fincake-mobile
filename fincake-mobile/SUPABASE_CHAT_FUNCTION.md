# Supabase Edge Function: chat

This function accepts `{ message, cluster_id? }`, optionally fetches related articles for the cluster, and returns `{ answer }` using OpenAI.

## 1) Create the function

In your local Supabase project folder (or create one):

```bash
supabase functions new chat
```

This creates `supabase/functions/chat/index.ts`.

## 2) Paste function code (TypeScript)

```ts
// supabase/functions/chat/index.ts
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, cluster_id } = await req.json();
    if (!message) {
      return new Response(JSON.stringify({ error: 'Missing message' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnon = Deno.env.get('SUPABASE_ANON_KEY')!;
    const openaiKey = Deno.env.get('OPENAI_API_KEY');

    let context = '';
    if (cluster_id) {
      const res = await fetch(`${supabaseUrl}/rest/v1/news?cluster_id=eq.${cluster_id}&select=title,summary&order=published_at.desc`, {
        headers: {
          apikey: supabaseAnon,
          Authorization: `Bearer ${supabaseAnon}`,
        },
      });
      if (res.ok) {
        const articles = await res.json();
        context = (articles as any[])
          .slice(0, 6)
          .map((a) => `- ${a.title}: ${a.summary}`)
          .join('\n');
      }
    }

    const prompt = `Bạn là trợ lý tài chính.\nNgữ cảnh (nếu có):\n${context}\n\nCâu hỏi: ${message}\n\nTrả lời ngắn gọn, tiếng Việt.`;

    let answer = 'Hiện chưa cấu hình AI. Vui lòng thêm OPENAI_API_KEY.';

    if (openaiKey) {
      const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'Bạn là trợ lý tài chính, trả lời ngắn gọn, rõ ràng.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.2,
        }),
      });
      const data = await aiRes.json();
      answer = data?.choices?.[0]?.message?.content ?? 'Không nhận được phản hồi từ AI.';
    }

    return new Response(JSON.stringify({ answer }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
});
```

## 3) Set environment variables

In your Supabase project settings → Functions → ENV:
- `OPENAI_API_KEY`: your OpenAI key
- `SUPABASE_URL`: `https://fwcktzrwaazlzxstbnbp.supabase.co`
- `SUPABASE_ANON_KEY`: your anon key

## 4) Deploy

```bash
supabase functions deploy chat --project-ref fwcktzrwaazlzxstbnbp
```

## 5) Test via curl

```bash
curl -X POST \
  "https://fwcktzrwaazlzxstbnbp.supabase.co/functions/v1/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"message":"HPG là gì?"}'
```

If this returns `{"answer": "..."}`, the app’s AI tab will work end-to-end.
