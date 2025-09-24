/*
 Minimal crawler + clustering for 23–24 Sep (VNExpress, CafeF, Vietstock)
 - Fetch via RSS/HTML (simplified)
 - Detect tickers (regex) and group clusters by ticker
 - Build ingest payload and POST to Supabase ingest function

 Usage:
   node tools/crawl-cluster.js --from 2024-09-23 --to 2024-09-24 \
     --functions https://<ref>.functions.supabase.co \
     --token <INGEST_TOKEN>
*/

import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

type Article = {
  title: string;
  summary: string;
  source_url: string;
  source: string;
  published_at: string;
};

type ClusterPayload = {
  topic: string;
  summary: string;
  articles: Article[];
};

const args = Object.fromEntries(process.argv.slice(2).map((v) => {
  const [k, ...rest] = v.split('=');
  return [k.replace(/^--/, ''), rest.join('=')];
}));

const FROM = args.from ?? '2024-09-23';
const TO = args.to ?? '2024-09-24';
const FUNCTIONS = args.functions;
const TOKEN = args.token;

function isInRange(dateStr: string) {
  const t = new Date(dateStr).getTime();
  return t >= new Date(FROM).getTime() && t <= new Date(TO + 'T23:59:59Z').getTime();
}

const tickerRegex = /\b[A-Z]{3,5}\b/g;

function detectTickers(text: string): string[] {
  const set = new Set((text.match(tickerRegex) || []).map(s => s.trim()));
  return Array.from(set);
}

function normalizeText(html: string) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function fetchVNExpress(): Promise<Article[]> {
  const url = 'https://vnexpress.net/rss/kinh-doanh/chung-khoan.rss';
  const res = await fetch(url);
  const txt = await res.text();
  const dom = new JSDOM(txt, { contentType: 'text/xml' });
  const items = Array.from(dom.window.document.querySelectorAll('item'));
  return items.map(it => {
    const title = it.querySelector('title')?.textContent || '';
    const link = it.querySelector('link')?.textContent || '';
    const pub = it.querySelector('pubDate')?.textContent || '';
    const desc = normalizeText(it.querySelector('description')?.textContent || '');
    return { title, summary: desc, source_url: link, source: 'vnexpress', published_at: new Date(pub).toISOString() };
  }).filter(a => isInRange(a.published_at));
}

async function fetchCafeF(): Promise<Article[]> {
  // Simplified: CafeF has RSS too
  const url = 'https://cafef.vn/thi-truong-chung-khoan.rss';
  const res = await fetch(url);
  const txt = await res.text();
  const dom = new JSDOM(txt, { contentType: 'text/xml' });
  const items = Array.from(dom.window.document.querySelectorAll('item'));
  return items.map(it => {
    const title = it.querySelector('title')?.textContent || '';
    const link = it.querySelector('link')?.textContent || '';
    const pub = it.querySelector('pubDate')?.textContent || '';
    const desc = normalizeText(it.querySelector('description')?.textContent || '');
    return { title, summary: desc, source_url: link, source: 'cafef', published_at: new Date(pub).toISOString() };
  }).filter(a => isInRange(a.published_at));
}

async function fetchVietstock(): Promise<Article[]> {
  // Vietstock may not expose RSS consistently; placeholder HTML parse for finance home
  const url = 'https://finance.vietstock.vn';
  const res = await fetch(url);
  const html = await res.text();
  const dom = new JSDOM(html);
  const nodes = Array.from(dom.window.document.querySelectorAll('a'))
    .slice(0, 50);
  const nowISO = new Date().toISOString();
  return nodes.map((a: any) => ({
    title: a.textContent?.trim() || 'Vietstock bài viết',
    summary: '',
    source_url: new URL(a.href, url).toString(),
    source: 'vietstock',
    published_at: nowISO,
  })).filter(a => !!a.title);
}

async function clusterByTicker(articles: Article[]): Promise<ClusterPayload[]> {
  const byTicker: Record<string, Article[]> = {};
  for (const a of articles) {
    const tickers = detectTickers(`${a.title} ${a.summary}`);
    if (tickers.length === 0) {
      const key = 'OTHER';
      byTicker[key] = byTicker[key] || [];
      byTicker[key].push(a);
      continue;
    }
    for (const t of tickers.slice(0, 2)) {
      byTicker[t] = byTicker[t] || [];
      byTicker[t].push(a);
    }
  }
  const clusters: ClusterPayload[] = Object.entries(byTicker).map(([ticker, arts]) => ({
    topic: ticker === 'OTHER' ? 'Tin thị trường' : `Chủ đề ${ticker}`,
    summary: `Tổng hợp ${arts.length} bài liên quan ${ticker}`,
    articles: arts.slice(0, 8),
  }));
  return clusters;
}

async function main() {
  if (!FUNCTIONS || !TOKEN) {
    console.error('Missing --functions or --token');
    process.exit(1);
  }
  const [vnexp, cafef, vietstock] = await Promise.all([
    fetchVNExpress().catch(() => []),
    fetchCafeF().catch(() => []),
    fetchVietstock().catch(() => []),
  ]);
  const all = [...vnexp, ...cafef, ...vietstock];
  const clusters = await clusterByTicker(all);

  const res = await fetch(`${FUNCTIONS}/ingest-news-preclustered`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify(clusters),
  });
  const body = await res.text();
  console.log('Ingest status:', res.status, body);
}

main();
