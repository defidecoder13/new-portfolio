import { defineConfig } from 'vite';
import { handleNotesRequest } from './api/notes.js';
import { handleContactRequest } from './api/contact.js';

export default defineConfig({
  server: {
    host: true,
    port: 5173,
  },
  plugins: [
    {
      name: 'portfolio-api-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url.startsWith('/api/notes')) {
            try {
              await handleNotesRequest(req, res);
            } catch (err) {
              console.error('[Vite API Notes Error]', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
            return;
          }

          if (req.url.startsWith('/api/contact')) {
            try {
              await handleContactRequest(req, res);
            } catch (err) {
              console.error('[Vite API Contact Error]', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
            return;
          }

          next();
        });
      },
    },
  ],
});
