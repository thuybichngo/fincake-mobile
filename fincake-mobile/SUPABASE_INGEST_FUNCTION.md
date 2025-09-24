# Supabase Edge Function: ingest-news-preclustered

Accepts JSON array of clusters and upserts into `news_clusters` and `news`.

## 1) Create the function

```bash
supabase functions new ingest-news-preclustered
```

## 2) Code (TypeScript)

```ts
// supabase/functions/ingest-news-preclustered/index.ts
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  const adminToken = Deno.env.get('INGEST_TOKEN');
  if (!adminToken || token !== adminToken) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }

  const body = await req.json();
  if (!Array.isArray(body)) {
    return new Response(JSON.stringify({ error: 'invalid_payload' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }

  const supabaseUrl = Deno.env.get('PROJECT_URL')!;
  const anon = Deno.env.get('ANON_KEY')!;

  let inserted = 0;
  for (const cluster of body) {
    const { topic, summary, articles } = cluster;
    // upsert cluster
    const up = await fetch(`${supabaseUrl}/rest/v1/news_clusters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: anon, Authorization: `Bearer ${anon}`, Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify([{ topic, summary }]),
    });
    const upRes = await up.json();
    const clusterId = upRes?.[0]?.id;

    if (clusterId && Array.isArray(articles)) {
      const rows = articles.map((a: any) => ({
        cluster_id: clusterId,
        title: a.title,
        summary: a.summary,
        source_url: a.source_url,
        source: a.source,
        published_at: a.published_at,
      }));
      const ins = await fetch(`${supabaseUrl}/rest/v1/news`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: anon, Authorization: `Bearer ${anon}` },
        body: JSON.stringify(rows),
      });
      if (ins.ok) inserted += rows.length;
    }
  }

  return new Response(JSON.stringify({ inserted }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
});
```

Add `supabase/functions/ingest-news-preclustered/functions.toml`:

```toml
[functions.ingest-news-preclustered]
verify_jwt = false
```

## 3) Secrets

```bash
supabase secrets set INGEST_TOKEN=YOUR_INGEST_TOKEN
supabase secrets set ANON_KEY=YOUR_ANON_KEY
supabase secrets set PROJECT_URL=https://fwcktzrwaazlzxstbnbp.supabase.co
```

## 4) Deploy

```bash
supabase functions deploy ingest-news-preclustered --project-ref fwcktzrwaazlzxstbnbp
```

## 5) Sample payload

See `samples/ingest.json`.

## 6) Test

```bash
iwr https://fwcktzrwaazlzxstbnbp.functions.supabase.co/ingest-news-preclustered -Method POST -Headers @{Authorization="Bearer YOUR_INGEST_TOKEN"; "Content-Type"="application/json"} -Body (Get-Content -Raw .\samples\ingest.json)
```
