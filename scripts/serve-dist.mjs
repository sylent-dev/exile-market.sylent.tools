// A static server for the built site, as GitHub Pages serves dist/: a folder serves its
// index.html. Shared by the checks that load the pages in a browser.
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join } from "node:path";

const types = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".webm": "video/webm",
  ".mp4": "video/mp4",
  ".woff2": "font/woff2",
};

/** Serves the folder on a free local port, and returns its origin and a way to stop it. */
export const serveDist = async (dist) => {
  const server = createServer((request, response) => {
    let path = join(dist, decodeURIComponent(request.url.split("?")[0]));
    if (existsSync(path) && statSync(path).isDirectory()) {
      path = join(path, "index.html");
    }
    if (!existsSync(path)) {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, {
      "content-type": types[extname(path)] ?? "application/octet-stream",
    });
    createReadStream(path).pipe(response);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    origin: `http://127.0.0.1:${server.address().port}`,
    close: () => server.close(),
  };
};
