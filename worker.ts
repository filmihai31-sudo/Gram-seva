/**
 * Cloudflare Worker Script for Gram Seva PWA
 * Inlines Manifest & SVG Icon to guarantee 100% PWA icon validation on PWABuilder & Cloudflare edge.
 */

const SVG_ICON_BASE64 = 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxOTIgMTkyIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiMxNmEzNGEiIGQ9Ik0wIDBoMTkydjE5MkgwVjB6Ii8+PHBhdGggZmlsbD0iI0ZGRiIgZD0iTTE2MCA5Ni4wNEMxNjAgNjEuNjIgMTMyLjQyIDMzIDk5Ljc2IDMzQzY3LjEgMzMgNDAuNDYgNjEuNjIgNDAuNDYgOTYuMDRDNDAuNDYgOTguNjYgNDAuNDYgMTAwIDEwMC4wMSA5Ni4wNEMxNTkuNTUgOTIuMDkgMTYwIDk4LjY2IDE2MCA5Ni4wNFoiLz48ZyBmaWxsPSIjRkZGRkZGIj48cGF0aCBkPSJNOTUuOTggNjMuMjhDOTUuOTggNTQuMjcgMTA4LjMgNDcuNTYgMTIzLjIzIDQ3LjU2QzEzOC4xNyA0Ny41NiAxNTAuNDggNTQuMjcgMTUwLjQ4IDYzLjI4QzE1MC40OCA3Mi4yOCAxMzguMTcgNzguOTkgMTIzLjIzIDc4Ljk5Qzk1Ljk4IDc4Ljk5IDk1Ljk4IDcyLjI4IDk1Ljk4IDYzLjI4WiIvPjxwYXRoIGQ9Ik05NC42MSA5MS44NEM5NC42MSA4NS45MiAxMDAuNDQgODEuMTMgMTA3LjgxIDgxLjEzQzExNS4xOSA4MS4xMyAxMjEuMDEgODUuOTIgMTIxLjAxIDkxLjg0QzEyMS4wMSA5Ny43NSAxMTUuMTkgMTAyLjU1IDEwNy44MSAxMDIuNTVDOTQuNjEgMTAyLjU1IDk0LjYxIDk3Ljc1IDk0LjYxIDkxLjg0WiIvPjwvZz48L2c+PC9zdmc+';

const MANIFEST_JSON = JSON.stringify({
  id: "/",
  name: "ग्राम सेवा - Gram Seva",
  short_name: "Gram Seva",
  description: "स्थानीय दुकान और मिस्त्री खोजने के लिए ऐप",
  start_url: "/",
  display: "standalone",
  orientation: "portrait",
  background_color: "#16a34a",
  theme_color: "#16a34a",
  icons: [
    {
      src: "/icon-192.png",
      sizes: "192x192",
      type: "image/svg+xml",
      purpose: "any"
    }
  ]
}, null, 2);

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const url = new URL(request.url);

    // 1. GET /manifest.json
    if (url.pathname === '/manifest.json') {
      return new Response(MANIFEST_JSON, {
        headers: {
          'Content-Type': 'application/manifest+json; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // 2. GET /icon-192.png or /icon.svg
    if (url.pathname === '/icon-192.png' || url.pathname === '/icon.svg') {
      const decodedSvg = typeof atob === 'function' 
        ? atob(SVG_ICON_BASE64) 
        : Buffer.from(SVG_ICON_BASE64, 'base64').toString('utf-8');
      
      return new Response(decodedSvg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Pass through all other requests to standard asset / app serving
    return fetch(request);
  }
};
