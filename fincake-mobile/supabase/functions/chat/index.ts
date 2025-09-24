// Supabase Edge Function: chat
// Accepts { message, cluster_id? } and returns { answer }
// Uses OpenAI if OPENAI_API_KEY is present; otherwise returns a fallback message.

import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type ChatPayload = {
  message?: string;
  cluster_id?: string;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, cluster_id }: ChatPayload = await req.json();
    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Missing message' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
      );
    }

    // Use custom env names because secrets cannot start with SUPABASE_
    const supabaseUrl = Deno.env.get('PROJECT_URL') || Deno.env.get('PUBLIC_SUPABASE_URL') || Deno.env.get('SUPABASE_URL');
    const supabaseAnon = Deno.env.get('ANON_KEY') || Deno.env.get('PUBLIC_SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_ANON_KEY');
    const openaiKey = Deno.env.get('OPENAI_API_KEY');

    let context = '';
    if (cluster_id && supabaseUrl && supabaseAnon) {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/news?cluster_id=eq.${cluster_id}&select=title,summary&order=published_at.desc`,
        {
          headers: {
            apikey: supabaseAnon,
            Authorization: `Bearer ${supabaseAnon}`,
          },
        },
      );
      if (res.ok) {
        const articles = (await res.json()) as Array<{ title: string; summary: string }>;
        context = articles
          .slice(0, 6)
          .map((a) => `- ${a.title}: ${a.summary}`)
          .join('\n');
      }
    }

    const prompt = `Bạn là trợ lý tài chính.\nNgữ cảnh (nếu có):\n${context}\n\nCâu hỏi: ${message}\n\nTrả lời ngắn gọn, tiếng Việt.`;

    let answer = 'Hiện chưa cấu hình AI. Vui lòng thêm OPENAI_API_KEY trong Supabase Functions ENV.';

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

    return new Response(
      JSON.stringify({ answer }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
    );
  }
});


