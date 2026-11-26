# Página web de John Ker y su Amigo Real

Contexto para retomar este proyecto en otra sesión de Claude o más adelante.

## Qué es

Página web de una sola página para **John Ker**, un viajero que recorre el mundo en moto y cuenta su viaje por capítulos en YouTube ("John Ker y su Amigo Real"). El "amigo real" es **Elvis, su perro**. Su moto es una **Harley-Davidson Pan America 1250 gris**.

- **En vivo:** https://john-ker.pages.dev
- **Código:** https://github.com/administracion787/pagina-john-ker (público, rama `main`)
- **Publicación:** Cloudflare Pages, proyecto `john-ker`, carpeta de salida `john-ker-web`, sin comando de compilación. Cada push a `main` se publica solo.
- **Redes de John:**
  - YouTube: @JOHNKERYSUAMIGOREALOFICIAL
  - Instagram, Facebook y TikTok: @johnkerysuamigorealoficial

## Estructura

| Ruta | Qué es |
|---|---|
| `john-ker-web/index.html` | Toda la página: HTML, CSS y JS en un solo archivo, sin frameworks |
| `john-ker-web/data/capitulos.js` | Capítulos traídos de YouTube (`window.JOHNKER`). Generado: no editar a mano |
| `john-ker-web/data/lugares.json` | Etapa, lugar y coordenadas de cada capítulo (para el mapa). Se edita a mano |
| `john-ker-web/scripts/actualizar-capitulos.mjs` | Lee el canal de YouTube y regenera `capitulos.js` (Node 18+, sin dependencias) |
| `john-ker-web/img/marca/` | Logo de fuego (WebP, fondo transparente), favicon e intro animada (MP4 comprimido) |
| `john-ker-web/img/fotos/` | Fotos de John, Elvis y la moto (cuadros de sus videos y foto de perfil del canal) |
| `john-ker-web/img/instagram/` | 11 imágenes de publicaciones de su Instagram |
| `john-ker-web/_headers` | Caché de Cloudflare |
| `.github/workflows/actualizar-capitulos.yml` | Tarea diaria (6:00 a. m. Colombia) que actualiza los capítulos y hace commit; probada y funcionando |
| `originales/` | Archivos de marca en alta calidad (logo y video originales del Drive del cliente, banner del canal). No se publican |

## Secciones de la página (en orden)

1. Intro con el logo animado (una vez por visita, con botón para saltarla)
2. Portada: bienvenida en primera persona ("¡Hola! Soy John", "Bienvenido a mi ruta"), 5 fotos de John que cambian con efecto de fuego, texto que se escribe solo con lugares y barra de números
3. Cinta naranja inclinada con los lugares (al cliente le gusta, no quitarla)
4. Carrusel automático "La ruta hasta hoy" (una tarjeta por lugar)
5. Último capítulo (sale de los datos de YouTube)
6. Historia de John (línea de tiempo)
7. Elvis, el amigo real (polaroids)
8. La moto: Pan America 1250 gris, con sus capítulos y el motor casa
9. Mapa (Leaflet + OpenStreetMap) con los lugares de cada capítulo
10. Todos los capítulos con filtros por etapa
11. Instagram, marcas/colaboraciones y redes

Estilo: fondo negro, fuego naranja/ámbar, rojo y cromo. Fuentes: Anton, Inter y Permanent Marker. Efectos: chispas en la portada, fotos que aparecen quemándose (motor `Burn` en canvas) y animaciones al aparecer. Todo respeta `prefers-reduced-motion`.

## Cómo trabajar

```powershell
cd john-ker-web
npm run dev          # sirve la página en http://localhost:5173
npm run actualizar   # trae los capítulos de YouTube
```

Para publicar un cambio: commit y `git push` a `main`. Cloudflare lo publica en uno o dos minutos.

Cuando John sube un capítulo nuevo:
1. La tarea diaria lo agrega sola.
2. Para que salga en el mapa, agregar su número en `data/lugares.json` con `etapa` (`origen`, `colombia`, `norte` o `europa`), `lugar`, `lat` y `lng`, y volver a correr `npm run actualizar`.

## Pendientes

- WhatsApp y correo de John: el botón de WhatsApp está desactivado (clase `pend`)
- Fotos originales en alta calidad de John, Elvis y la moto (las actuales salen de cuadros de video)
- Dominio propio (por ejemplo johnker.com), para agregar en Cloudflare, en Custom domains
- Confirmar los enlaces de Facebook y TikTok (se armaron con el usuario que aparece en las descripciones de YouTube)
- En qué playa fue el capítulo 1
- Los textos de la portada hablan como John: que él los apruebe

## Notas

- Los datos del canal se leen de la página pública de YouTube (no se usa la API ni hay claves). Si YouTube cambia su HTML, revisar `extraerJSON` en el script.
- Las cuentas de GitHub y Cloudflare son de la agencia. No hay contraseñas ni claves en este proyecto.
