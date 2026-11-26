# Página web — John Ker y su Amigo Real

Sitio de una sola página, conectado al canal de YouTube y a las redes de John Ker.

## Cómo verla

```powershell
npm run dev
```

Luego abre http://localhost:5173

## Cómo traer capítulos nuevos de YouTube

```powershell
npm run actualizar
```

El script `scripts/actualizar-capitulos.mjs`:

- lee el canal y detecta los videos que dicen "Capítulo N" en el título;
- trae la duración, las vistas, la fecha y la descripción de cada uno;
- guarda todo en `data/capitulos.js`, que es lo que lee la página.

Así, la página muestra sola el último capítulo, la lista completa, las vistas totales y los suscriptores.

**Cuando sale un capítulo nuevo:** agrega su lugar en `data/lugares.json` (etapa, lugar y coordenadas) para que aparezca en el mapa. Después vuelve a correr `npm run actualizar`.

## Estructura

| Archivo | Qué es |
|---|---|
| `index.html` | La página completa: diseño y funciones |
| `data/capitulos.js` | Capítulos traídos de YouTube (generado, no se edita a mano) |
| `data/lugares.json` | Lugar y coordenadas de cada capítulo (se edita a mano) |
| `img/instagram/` | Fotos descargadas del Instagram de John |
| `scripts/actualizar-capitulos.mjs` | Conexión con YouTube |

## Imágenes de marca

| Archivo | Origen |
|---|---|
| `img/marca/logo-960.webp`, `logo-360.webp`, `favicon.png` | Logo de fuego de la carpeta de Drive, recortado, con fondo transparente y aligerado |
| `img/marca/intro-logo.mp4`, `intro-logo-movil.mp4` | Intro animada del logo, comprimida (computador y celular). Se muestra una vez por visita |
| `img/fotos/john-y-elvis.jpg` | Foto de perfil del canal: John con Elvis |
| `img/fotos/john-*.jpg`, `elvis-*.jpg`, `intro-john-elvis.jpg` | Cuadros de los videos del canal |
| `img/fotos/pan-america.jpg` | Recorte de la miniatura del capítulo 28 |

Los archivos originales en alta calidad (logo de Drive, video original, banner del canal) están en la carpeta `originales/`, fuera del sitio, para que no se publiquen ni pesen.

## Publicar en Cloudflare Pages

La carpeta que se publica es `john-ker-web`. No necesita compilar nada.

1. Crear un repositorio en GitHub (privado está bien) y subir esta carpeta del proyecto.
2. En Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**, y elegir el repositorio.
3. Configuración de la compilación:
   - Framework preset: **None**
   - Build command: *(vacío)*
   - Build output directory: **`john-ker-web`**
4. Guardar y publicar. Cloudflare da una dirección `*.pages.dev`. Luego, en **Custom domains**, se agrega el dominio de John.

Cada cambio que se sube a GitHub se publica solo.

### Actualización diaria de capítulos

El archivo `.github/workflows/actualizar-capitulos.yml` corre todos los días a las 6:00 a. m. (hora de Colombia). Trae los capítulos del canal, guarda los cambios en GitHub y Cloudflare vuelve a publicar la página. También se puede correr a mano desde la pestaña **Actions** del repositorio.

Si YouTube bloquea la lectura desde los servidores de GitHub, la tarea falla sin borrar nada y la página sigue con los capítulos que ya tenía. En ese caso basta correr `npm run actualizar` en este computador y subir el cambio.

## Pendiente con el cliente

- Número de WhatsApp y correo de contacto
- Fotos originales en alta calidad, sobre todo de la Pan America 1250 gris y de Elvis (las actuales salen de miniaturas y cuadros de video)
- Confirmar los enlaces de Facebook y TikTok (se armaron con el usuario que aparece en las descripciones de YouTube)
- Dónde fue la playa del capítulo 1
- Dominio propio (por ejemplo johnker.com) y cuentas de GitHub y Cloudflare a nombre de John o de la agencia
