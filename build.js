/*
  Gera o site a partir dos arquivos em content/.
  - Copia tudo de src/ para _site/
  - Cria uma página para cada artigo em content/artigos/*.md
  - Monta a lista de artigos e as entrevistas em artigos.html
  - Atualiza o sitemap.xml
  A Netlify roda este script automaticamente a cada publicação (ver netlify.toml).
*/
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const SRC = 'src', OUT = '_site', SITE = 'https://romercarvalho.adv.br';

// Etapas da jornada: âncora na página inicial, árvore, estação e grupo do filtro
const STAGES = {
  'Gestação':                { anchor: 'gestacao',     tree: 1, season: 'spring', group: 'Gestação' },
  'Filiação':                { anchor: 'filiacao',     tree: 2, season: 'spring', group: 'Filiação' },
  'União':                   { anchor: 'uniao',        tree: 3, season: 'summer', group: 'União' },
  'Divórcio':                { anchor: 'divorcio',     tree: 4, season: 'autumn', group: 'Divórcio' },
  'Maturidade':              { anchor: 'maturidade',   tree: 5, season: 'autumn', group: 'Maturidade' },
  'Planejamento sucessório': { anchor: 'planejamento', tree: 6, season: 'winter', group: 'Sucessões' },
  'Sucessão':                { anchor: 'sucessao',     tree: 7, season: 'winter', group: 'Sucessões' },
  'Direito Civil':           { anchor: null,           tree: 0, season: 'civil',  group: 'Direito Civil' }
};
const ORDER = Object.keys(STAGES);
const FILTERS = ['Todos', 'Gestação', 'Filiação', 'União', 'Divórcio', 'Maturidade', 'Sucessões', 'Direito Civil'];

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slugify = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const isoDate = d => (d instanceof Date ? d.toISOString() : String(d || '')).slice(0, 10);

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name), b = path.join(to, e.name);
    if (e.name === 'artigos.template.html') continue;
    e.isDirectory() ? copyDir(a, b) : fs.copyFileSync(a, b);
  }
}

fs.rmSync(OUT, { recursive: true, force: true });
copyDir(SRC, OUT);
copyDir('admin', path.join(OUT, 'admin'));

// ---- read articles ----
const articles = fs.readdirSync('content/artigos').filter(f => f.endsWith('.md')).map(f => {
  const { data, content } = matter(fs.readFileSync(path.join('content/artigos', f), 'utf8'));
  const stage = STAGES[data.stage] ? data.stage : 'Direito Civil';
  return {
    slug: slugify(path.basename(f, '.md')),
    title: data.title || path.basename(f, '.md'),
    stage, meta: STAGES[stage],
    lede: data.lede || '',
    date: isoDate(data.date),
    draft: !!data.draft,
    refs: Array.isArray(data.refs) ? data.refs.filter(Boolean) : [],
    html: marked.parse(content || ''),
    words: (content + ' ' + (data.lede || '')).split(/\s+/).filter(Boolean).length
  };
}).filter(a => !a.draft)
  .sort((a, b) => ORDER.indexOf(a.stage) - ORDER.indexOf(b.stage) || b.date.localeCompare(a.date) || a.title.localeCompare(b.title));

// ---- shared pieces taken from the existing pages ----
const tpl = fs.readFileSync(path.join(SRC, 'artigos.template.html'), 'utf8');
const indexHtml = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');
const sprite = indexHtml.match(/<svg class="sprite"[\s\S]*?<\/svg>\n/)[0];
const fonts = tpl.slice(tpl.indexOf('<link rel="preconnect"'), tpl.indexOf('<link rel="stylesheet" href="styles.css">')).trim();
const brand = tpl.match(/<a class="brand"[\s\S]*?<\/a>/)[0].replace('href="index.html"', 'href="../index.html"');
const contact = tpl.slice(tpl.indexOf('<section class="contact"'), tpl.indexOf('<footer>'));
const footer = tpl.slice(tpl.indexOf('<footer>'), tpl.indexOf('</footer>') + 9);

const DOC_ICON = '<svg class="kt" viewBox="0 0 48 48" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="12" y="8" width="24" height="32" rx="3"/><path d="M17 16h14M17 22h14M17 28h9"/></g></svg>';
const icon = a => a.meta.tree ? `<svg class="kt" viewBox="0 0 48 48" aria-hidden="true"><use href="#t${a.meta.tree}"/></svg>` : DOC_ICON;
const refsList = a => a.refs.map(r => `<li>${esc(r)}</li>`).join('');
const NOTE = 'Este artigo tem caráter informativo e não substitui a análise individual do seu caso.';

// ---- article pages ----
fs.mkdirSync(path.join(OUT, 'artigos'), { recursive: true });
for (const a of articles) {
  const mins = Math.max(2, Math.round(a.words / 200));
  let rel = articles.filter(r => r !== a && r.meta.group === a.meta.group).slice(0, 3);
  if (rel.length < 2) rel = rel.concat(articles.filter(r => r !== a && !rel.includes(r))).slice(0, 3);
  const back = a.meta.anchor
    ? `<a class="btn btn-ghost" href="../index.html#${a.meta.anchor}">Ver a etapa ${esc(a.stage)} na jornada</a>`
    : '<a class="btn btn-ghost" href="../direito-civil.html">Conhecer a área de Direito Civil</a>';
  const ld = { '@context': 'https://schema.org', '@type': 'Article', headline: a.title, description: a.lede, datePublished: a.date, inLanguage: 'pt-BR',
    author: { '@type': 'Person', name: 'Romer Carvalho', identifier: 'OAB/RJ 148.959' }, publisher: { '@type': 'LegalService', name: 'Romer Carvalho Advocacia' } };
  const page = `<!doctype html>
<html lang="pt-BR" class="season-${a.meta.season}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(a.title)} · Romer Carvalho Advocacia</title>
<meta name="description" content="${esc(a.lede)}">
<link rel="canonical" href="${SITE}/artigos/${a.slug}.html">
<meta property="og:type" content="article">
<meta property="og:locale" content="pt_BR">
<meta property="og:title" content="${esc(a.title)}">
<meta property="og:description" content="${esc(a.lede)}">
<meta property="og:image" content="${SITE}/og-image.png">
<link rel="icon" href="../favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="../apple-touch-icon.png">
${fonts}
<link rel="stylesheet" href="../styles.css">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
</head>
<body>
${sprite}<nav class="nav" aria-label="Principal">
  <div class="wrap">
    ${brand}
    <ul>
      <li><a href="../index.html#jornada">Família e Sucessões</a></li>
      <li><a href="../direito-civil.html">Direito Civil</a></li>
      <li><a href="../artigos.html" aria-current="page">Artigos</a></li>
    </ul>
    <a class="btn btn-primary" href="#contato">Contato</a>
  </div>
</nav>

<article class="article">
  <div class="wrap">
    <a class="crumb" href="../artigos.html">‹ Todos os artigos</a>
    <header class="a-head">
      <p class="kicker">${icon(a)}${esc(a.stage)}</p>
      <h1>${esc(a.title)}</h1>
      <p class="a-lede">${esc(a.lede)}</p>
      <p class="a-meta">Por Romer Carvalho · OAB/RJ 148.959 · ${mins} min de leitura</p>
    </header>
    <div class="a-body">
${a.html}
    </div>
${a.refs.length ? `    <aside class="a-refs">
      <p class="eyebrow">Fundamentos legais</p>
      <ul>${refsList(a)}</ul>
    </aside>` : ''}
    <p class="a-note">${NOTE}</p>
    <div class="a-back">${back}</div>
  </div>
</article>

<section class="related">
  <div class="wrap">
    <h2>Leia também</h2>
    <div class="post-grid">
${rel.map(r => `      <a class="post s-${r.meta.season}" href="${r.slug}.html"><span class="post-k">${icon(r)}${esc(r.stage)}</span><h3>${esc(r.title)}</h3><span class="more">Ler artigo ›</span></a>`).join('\n')}
    </div>
  </div>
</section>

${contact}${footer}
<script src="../analytics.js"></script>
<script src="../site.js"></script>
</body>
</html>
`;
  fs.writeFileSync(path.join(OUT, 'artigos', a.slug + '.html'), page);
}

// ---- listing page ----
const groupsPresent = new Set(articles.map(a => a.meta.group));
const chips = FILTERS.filter(f => f === 'Todos' || groupsPresent.has(f))
  .map(f => `<button type="button" class="chip${f === 'Todos' ? ' on' : ''}" data-f="${f}" aria-pressed="${f === 'Todos'}">${f}</button>`).join('\n');
const cards = articles.map(a => {
  const back = a.meta.anchor ? `<a class="btn btn-ghost" href="index.html#${a.meta.anchor}">Ver a etapa na jornada</a>` : '<a class="btn btn-ghost" href="direito-civil.html">Conhecer a área</a>';
  const inner = a.html.replace(/<(\/?)h2>/g, '<$1h4>');
  return `      <article class="post s-${a.meta.season}" id="${a.slug}" data-g="${a.meta.group}">
        <a class="post-link" href="artigos/${a.slug}.html" aria-expanded="false" aria-controls="full-${a.slug}">
          <span class="post-k">${icon(a)}${esc(a.stage)}</span>
          <h3>${esc(a.title)}</h3>
          <p class="post-sum">${esc(a.lede)}</p>
          <span class="more"><span class="m-open">Ler artigo ›</span><span class="m-close">Fechar ×</span></span>
        </a>
        <div class="post-full" id="full-${a.slug}" hidden>
          ${inner}
          ${a.refs.length ? `<div class="pf-refs"><span class="eyebrow">Fundamentos legais</span><ul>${refsList(a)}</ul></div>` : ''}
          <p class="a-note">${NOTE}</p>
          <div class="pf-actions">${back}<a class="btn btn-ghost" href="artigos/${a.slug}.html">Abrir em página própria</a><button type="button" class="pf-close">Fechar artigo</button></div>
        </div>
      </article>`;
}).join('\n');

let videos = [];
try { videos = (JSON.parse(fs.readFileSync('content/entrevistas.json', 'utf8')).videos || []).filter(v => v && v.url); } catch (e) {}
const PLAY = '<span class="play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M9 7.5v9l7.5-4.5z" fill="currentColor"/></svg></span>';
const videosHtml = videos.length ? `<section class="videos" id="entrevistas">
  <div class="wrap">
    <div class="sec-head">
      <h2>Entrevistas</h2>
      <p>Conversas sobre Direito de Família em programas, podcasts e canais.</p>
    </div>
    <div class="video-grid">
${videos.map(v => `      <a class="video" href="${esc(v.url)}" target="_blank" rel="noopener" data-yt="">
        ${PLAY}
        <span class="v-meta">${v.programa ? `<span class="post-k">${esc(v.programa)}</span>` : ''}<strong>${esc(v.titulo || 'Entrevista')}</strong><span class="more">Assistir no YouTube ›</span></span>
      </a>`).join('\n')}
    </div>
  </div>
</section>
` : '';

let listing = tpl.replace('<!--CHIPS-->', chips).replace('<!--CARDS-->', cards).replace('<!--VIDEOS-->\n', videosHtml)
  .replace('<!--NAV-VIDEOS-->', videos.length ? '<li><a href="#entrevistas">Entrevistas</a></li>' : '');
if (!videos.length) listing = listing.replace('<p class="eyebrow">Artigos e entrevistas</p>', '<p class="eyebrow">Artigos</p>')
  .replace('<title>Artigos e entrevistas', '<title>Artigos').replace(/(<h1>[^]*?<\/h1>\n\s*<p class="lede">)Textos e conversas/, '$1Textos');
fs.writeFileSync(path.join(OUT, 'artigos.html'), listing);

// ---- sitemap ----
const today = new Date().toISOString().slice(0, 10);
const urls = [['', today], ['direito-civil.html', today], ['artigos.html', today]].concat(articles.map(a => ['artigos/' + a.slug + '.html', a.date || today]));
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(([u, d]) => `  <url><loc>${SITE}/${u}</loc><lastmod>${d}</lastmod></url>`).join('\n') + '\n</urlset>\n');

console.log(`Site gerado em ${OUT}/: ${articles.length} artigos, ${videos.length} entrevistas.`);
