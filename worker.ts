// ==========================================
// Cloudflare Worker for Gram Seva PWA
// Fetches static assets from origin or local fallback
// ==========================================

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const url = new URL(request.url);

    // Fetch the asset from the origin (Vite build / hosting)
    const response = await fetch(request);

    // Set correct Content-Type and CORS headers for PWA assets
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', '*');

    if (url.pathname.endsWith('.png')) {
      headers.set('Content-Type', 'image/png');
      headers.set('Cache-Control', 'public, max-age=86400');
    } else if (url.pathname.endsWith('manifest.json')) {
      headers.set('Content-Type', 'application/manifest+json; charset=utf-8');
      headers.set('Cache-Control', 'public, max-age=3600');
    } else if (url.pathname.endsWith('.svg')) {
      headers.set('Content-Type', 'image/svg+xml');
      headers.set('Cache-Control', 'public, max-age=86400');
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};
