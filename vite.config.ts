import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

const SVG_ICON_BASE64 = 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxOTIgMTkyIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiMxNmEzNGEiIGQ9Ik0wIDBoMTkydjE5MkgwVjB6Ii8+PHBhdGggZmlsbD0iI0ZGRiIgZD0iTTE2MCA5Ni4wNEMxNjAgNjEuNjIgMTMyLjQyIDMzIDk5Ljc2IDMzQzY3LjEgMzMgNDAuNDYgNjEuNjIgNDAuNDYgOTYuMDRDNDAuNDYgOTguNjYgNDAuNDYgMTAwIDEwMC4wMSA5Ni4wNEMxNTkuNTUgOTIuMDkgMTYwIDk4LjY2IDE2MCA5Ni4wNFoiLz48ZyBmaWxsPSIjRkZGRkZGIj48cGF0aCBkPSJNOTUuOTggNjMuMjhDOTUuOTggNTQuMjcgMTA4LjMgNDcuNTYgMTIzLjIzIDQ3LjU2QzEzOC4xNyA0Ny41NiAxNTAuNDggNTQuMjcgMTUwLjQ4IDYzLjI4QzE1MC40OCA3Mi4yOCAxMzguMTcgNzguOTkgMTIzLjIzIDc4Ljk5Qzk1Ljk4IDc4Ljk5IDk1Ljk4IDcyLjI4IDk1Ljk4IDYzLjI4WiIvPjxwYXRoIGQ9Ik05NC42MSA5MS44NEM5NC42MSA4NS45MiAxMDAuNDQgODEuMTMgMTA3LjgxIDgxLjEzQzExNS4xOSA4MS4xMyAxMjEuMDEgODUuOTIgMTIxLjAxIDkxLjg0QzEyMS4wMSA5Ny43NSAxMTUuMTkgMTAyLjU1IDEwNy44MSAxMDIuNTVDOTQuNjEgMTAyLjU1IDk0LjYxIDk3Ljc1IDk0LjYxIDkxLjg0WiIvPjwvZz48L2c+PC9zdmc+';

const pwaAssetsPlugin = (): Plugin => ({
  name: 'pwa-assets-plugin',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/icon-192.png' || req.url === '/icon.svg') {
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.setHeader('Access-Control-Allow-Origin', '*');
        const svg = Buffer.from(SVG_ICON_BASE64, 'base64').toString('utf-8');
        res.end(svg);
        return;
      }
      next();
    });
  }
});

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), pwaAssetsPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
