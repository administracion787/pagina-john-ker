// Actualiza los capítulos de la página leyendo el canal de YouTube de John Ker.
// Uso:  npm run actualizar      (o)   node scripts/actualizar-capitulos.mjs
//
// 1. Lee la pestaña "Videos" del canal y encuentra los videos cuyo título dice "Capítulo N".
// 2. Abre cada video para sacar duración, vistas, fecha y descripción.
// 3. Le suma los datos del mapa que están en data/lugares.json (se editan a mano).
// 4. Escribe data/capitulos.js, que es lo que lee la página.
// Los capítulos que ya estaban guardados no se borran aunque YouTube no los muestre en la primera página.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CANAL = 'https://www.youtube.com/@JOHNKERYSUAMIGOREALOFICIAL';
const SALIDA = path.join(RAIZ, 'data', 'capitulos.js');
const LUGARES = path.join(RAIZ, 'data', 'lugares.json');
const HEADERS = {
  'accept-language': 'es-CO,es;q=0.9',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36',
  cookie: 'SOCS=CAI; CONSENT=YES+',
};

async function pagina(url) {
  const r = await fetch(url, { headers: HEADERS });
  if (!r.ok) throw new Error(`${url} respondió ${r.status}`);
  return r.text();
}

function extraerJSON(html, nombre) {
  const i = html.indexOf(nombre);
  if (i < 0) return null;
  const inicio = html.indexOf('{', i);
  // Recorre llaves balanceadas respetando strings
  let prof = 0, enStr = false, esc = false;
  for (let j = inicio; j < html.length; j++) {
    const c = html[j];
    if (enStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') enStr = false; continue; }
    if (c === '"') enStr = true;
    else if (c === '{') prof++;
    else if (c === '}' && --prof === 0) return JSON.parse(html.slice(inicio, j + 1));
  }
  return null;
}

function recorrer(o, fn) {
  if (!o || typeof o !== 'object') return;
  fn(o);
  for (const k in o) recorrer(o[k], fn);
}

const limpiarTitulo = t => t
  .replace(/\s*[|–-]?\s*John Ker y su Amigo Real.*$/i, '')
  .replace(/\s+/g, ' ')
  .trim();

function duracion(seg) {
  seg = Number(seg) || 0;
  const h = Math.floor(seg / 3600), m = Math.floor((seg % 3600) / 60), s = seg % 60;
  return (h ? `${h}:${String(m).padStart(2, '0')}` : `${m}`) + `:${String(s).padStart(2, '0')}`;
}

function resumen(desc = '') {
  const cuerpo = desc.split(/🔔|📲|🏍️ Ruta|📍/)[0].trim();
  return cuerpo.length > 700 ? cuerpo.slice(0, 700).replace(/\s+\S*$/, '') + '…' : cuerpo;
}

function ruta(desc = '') {
  const m = desc.match(/📍\s*([^\n]+)/);
  return m ? m[1].trim() : null;
}

async function main() {
  console.log('Leyendo el canal…');
  const htmlCanal = await pagina(`${CANAL}/videos`);
  const data = extraerJSON(htmlCanal, 'var ytInitialData');
  if (!data) throw new Error('No se pudo leer el canal (YouTube cambió la página o pidió verificación).');

  const encontrados = new Map();
  recorrer(data, o => {
    if (o.lockupViewModel?.contentId) {
      const titulo = o.lockupViewModel.metadata?.lockupMetadataViewModel?.title?.content;
      if (titulo) encontrados.set(o.lockupViewModel.contentId, titulo);
    }
    if (o.videoRenderer?.videoId) {
      encontrados.set(o.videoRenderer.videoId, o.videoRenderer.title?.runs?.map(r => r.text).join('') ?? '');
    }
  });

  const txt = JSON.stringify(data);
  const subs = (txt.match(/"content":"([\d.,]+\s*(?:K|M|mil)?\s*suscriptores)"/i) || [])[1] ?? null;
  const totalVideos = (txt.match(/"content":"(\d+)\s*videos"/i) || [])[1] ?? null;

  const anterior = new Map();
  try {
    const viejo = await fs.readFile(SALIDA, 'utf8');
    const json = JSON.parse(viejo.slice(viejo.indexOf('{'), viejo.lastIndexOf('}') + 1));
    for (const c of json.capitulos) anterior.set(c.id, c);
  } catch { /* primera vez */ }

  let lugares = {};
  try { lugares = JSON.parse(await fs.readFile(LUGARES, 'utf8')); } catch { /* sin lugares */ }

  const capitulos = new Map(anterior);
  for (const [id, tituloCompleto] of encontrados) {
    const num = Number((tituloCompleto.match(/Cap[ií]tulo\s*0*(\d+)/i) || [])[1]);
    if (!num) continue; // sólo videos de la serie
    process.stdout.write(`  Capítulo ${num}… `);
    try {
      const html = await pagina(`https://www.youtube.com/watch?v=${id}`);
      const player = extraerJSON(html, 'var ytInitialPlayerResponse');
      const vd = player?.videoDetails ?? {};
      const mf = player?.microformat?.playerMicroformatRenderer ?? {};
      capitulos.set(id, {
        num, id,
        titulo: limpiarTitulo(vd.title || tituloCompleto),
        duracion: duracion(vd.lengthSeconds),
        vistas: Number(vd.viewCount) || 0,
        fecha: (mf.publishDate || '').slice(0, 10) || null,
        descripcion: resumen(vd.shortDescription),
        ruta: ruta(vd.shortDescription),
      });
      console.log('ok');
    } catch (e) {
      console.log('no se pudo (' + e.message + '), se deja lo anterior');
    }
  }

  const lista = [...capitulos.values()]
    .map(c => ({ ...c, ...(lugares[c.num] || {}) }))
    .sort((a, b) => b.num - a.num);

  const salida = {
    actualizado: new Date().toISOString(),
    canal: { url: CANAL, suscriptores: subs, videos: totalVideos ? Number(totalVideos) : null },
    capitulos: lista,
  };
  await fs.mkdir(path.dirname(SALIDA), { recursive: true });
  await fs.writeFile(SALIDA,
    '// Archivo generado por scripts/actualizar-capitulos.mjs — no editar a mano.\n' +
    'window.JOHNKER = ' + JSON.stringify(salida, null, 2) + ';\n', 'utf8');
  console.log(`\nListo: ${lista.length} capítulos guardados en data/capitulos.js`);
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
