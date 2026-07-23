// Production startup file for cPanel "Setup Node.js App" (Phusion Passenger).
// Passenger loads THIS file and provides the port via process.env.PORT.
// It boots Next.js in production mode and hands every request to Next's
// request handler (which runs routing, middleware, SSR and API routes).
//
// Requires a production build to exist first: run `npm run build` (locally,
// then upload the `.next` folder) so this server has something to serve.

const { createServer } = require("http");
const next = require("next");

const port = process.env.PORT || 3000;
const app = next({ dev: false });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => handle(req, res)).listen(port, () => {
      console.log(`> CPP Judge ready on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start Next.js server:", err);
    process.exit(1);
  });
