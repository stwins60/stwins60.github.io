#!/usr/bin/env node
// Pulls profile content from https://africantech.dev into _data/africantech.json.
//
// No dependencies (Node 18+). Run locally with `node scripts/sync-africantech.mjs`;
// the "Sync from africantech.dev" workflow runs it on a schedule.
//
// Everything scraped is treated as untrusted: tags are stripped, entities
// decoded, lengths capped and URLs restricted to http(s). The templates escape
// it again on output. If a section that should always exist comes back empty
// (e.g. the source markup changed) the script exits non-zero and leaves the
// existing JSON untouched rather than blanking the site.

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ORIGIN = 'https://africantech.dev';
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '_data', 'africantech.json');
const MAX_ARTICLES = 12;

async function get(pathname) {
  const res = await fetch(new URL(pathname, ORIGIN), {
    headers: { 'user-agent': 'stwins60.github.io content sync (+https://github.com/stwins60/stwins60.github.io)' },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`GET ${pathname} -> HTTP ${res.status}`);
  return res.text();
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', hellip: '…', mdash: '—', ndash: '–', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“' };

function decode(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);?/gi, (m, e) => {
    if (e[0] === '#') {
      const cp = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(cp) && cp > 0 && cp < 0x110000 ? String.fromCodePoint(cp) : '';
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

// Leading emoji in titles clash with the site's type; drop them.
const cleanTitle = (t) => t.replace(/^(\p{Extended_Pictographic}|️|\s)+/u, '');

function text(html, max = 2000) {
  const t = decode(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
  return t.length > max ? t.slice(0, max - 1).trimEnd() + '…' : t;
}

function safeUrl(raw) {
  if (!raw) return null;
  // The source sitemap uses a placeholder host, and prefixes external links
  // with it too (https://example.comhttps://medium.com/...); keep the last absolute URL.
  const last = raw.lastIndexOf('http');
  let u;
  try { u = new URL(decode(last > 0 ? raw.slice(last) : raw), ORIGIN); } catch { return null; }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
  if (u.hostname === 'example.com') u = new URL(u.pathname, ORIGIN);
  u.protocol = 'https:';
  for (const k of [...u.searchParams.keys()]) {
    if (k === 'source' || k.startsWith('utm_')) u.searchParams.delete(k);
  }
  u.hash = '';
  return u.toString();
}

const withoutComments = (html) => html.replace(/<!--[\s\S]*?-->/g, '');

function blocks(html, className) {
  // Chunks of markup starting at each element carrying `className`.
  const re = new RegExp(`<[a-z0-9]+[^>]*class="[^"]*\\b${className}\\b[^"]*"`, 'gi');
  const starts = [...html.matchAll(re)].map((m) => m.index);
  return starts.map((s, i) => html.slice(s, starts[i + 1] ?? s + 8000));
}

function field(chunk, className) {
  const m = chunk.match(new RegExp(`class="[^"]*\\b${className}\\b[^"]*"[^>]*>([\\s\\S]*?)</(div|p|span|h\\d)>`, 'i'));
  return m ? text(m[1]) : '';
}

function parseHome(html) {
  html = withoutComments(html);

  const about = text(html.match(/About Me\s*<\/h\d>\s*<p[^>]*>([\s\S]*?)<\/p>/i)?.[1] ?? '', 600);
  const bio = text(html.match(/Biography\s*<\/h\d>\s*<p[^>]*>([\s\S]*?)<\/p>/i)?.[1] ?? '', 600);

  const services = blocks(html, 'service-box-s1')
    .map((c) => ({ title: field(c, 'title'), text: field(c, 'description') }))
    .filter((s) => s.title && s.text);

  const experience = [];
  const education = [];
  for (const c of blocks(html, 'experience-card-s2')) {
    const item = {
      org: field(c, 'experience-card-s2__org'),
      period: field(c, 'experience-card-s2__duration').replace(/\s*[-–—]\s*/g, ' — '),
      title: field(c, 'experience-card-s2__title'),
      description: field(c, 'experience-card-s2__desc'),
    };
    if (!item.org || !item.title) continue;
    const isDegree = !item.description ||
      /\b(masters?|bachelors?|associates?|degree|diploma|b\.?sc?|m\.?sc?|ph\.?d)\b/i.test(item.title);
    (isDegree ? education : experience).push(item);
  }

  const cards = [];
  for (const c of blocks(html, 'blog-card__title')) {
    const m = c.match(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    const url = m && safeUrl(m[1]);
    if (url) cards.push({ title: cleanTitle(text(m[2], 200)), url });
  }

  return { about, bio, services, experience, education, cards };
}

function parseBlogList(html) {
  const posts = [];
  for (const m of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    let data;
    try { data = JSON.parse(m[1]); } catch { continue; }
    for (const p of [].concat(data.blogPost ?? [])) {
      const url = safeUrl(p.url);
      if (!url || !p.headline) continue;
      const title = cleanTitle(text(String(p.headline), 200));
      let summary = text(String(p.description ?? '').replace(/Continue reading on Medium\s*»?/i, ''), 280);
      // Some feed items carry the article body (title first) instead of a teaser.
      if (summary.startsWith(title)) summary = '';
      posts.push({ title, url, date: String(p.datePublished ?? '').slice(0, 10), summary });
    }
  }
  return posts;
}

function parseSitemapDates(xml) {
  const dates = new Map();
  for (const m of xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/gi)) {
    const url = safeUrl(m[1]);
    if (url) dates.set(url, m[2].slice(0, 10));
  }
  return dates;
}

function hostLabel(url) {
  const h = new URL(url).hostname.replace(/^www\./, '');
  return h === 'medium.com' ? 'Medium' : h;
}

async function main() {
  const [home, blogList, sitemap] = await Promise.all([
    get('/'),
    get('/blog-list/'),
    get('/sitemap.xml').catch(() => ''),
  ]);

  const h = parseHome(home);
  const dates = parseSitemapDates(sitemap);

  const byUrl = new Map();
  for (const p of parseBlogList(blogList)) byUrl.set(p.url, p);
  for (const c of h.cards) {
    if (!byUrl.has(c.url)) byUrl.set(c.url, { title: c.title, url: c.url, date: '', summary: '' });
  }
  const articles = [...byUrl.values()]
    .map((a) => ({ ...a, date: a.date || dates.get(a.url) || '', source: hostLabel(a.url) }))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, MAX_ARTICLES);

  const problems = [];
  if (!h.about) problems.push('about text');
  if (h.services.length === 0) problems.push('services');
  if (h.experience.length === 0) problems.push('experience');
  if (articles.length === 0) problems.push('articles');
  if (problems.length) {
    console.error(`Refusing to write: could not parse ${problems.join(', ')} from ${ORIGIN}. Has its markup changed?`);
    process.exit(1);
  }

  const out = {
    source: ORIGIN,
    about: h.about,
    bio: h.bio,
    services: h.services,
    experience: h.experience,
    education: h.education,
    articles,
  };
  const json = JSON.stringify(out, null, 2) + '\n';

  const prev = await readFile(OUT, 'utf8').catch(() => '');
  if (prev === json) {
    console.log('africantech.json is already up to date.');
    return;
  }
  await writeFile(OUT, json);
  console.log(`Updated ${path.relative(process.cwd(), OUT)}: ${h.services.length} services, ${h.experience.length} roles, ${h.education.length} degrees, ${articles.length} articles.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
