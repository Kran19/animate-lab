import http from 'http';

export class LocalTestServer {
  private server: http.Server | null = null;
  public port = 4321;
  public baseUrl = `http://127.0.0.1:${this.port}`;

  public async start(port = 4321): Promise<string> {
    this.port = port;
    this.baseUrl = `http://127.0.0.1:${this.port}`;

    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        const urlObj = new URL(req.url || '/', this.baseUrl);
        const pathname = urlObj.pathname;

        if (pathname === '/') {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <head>
                <title>Test Home</title>
                <link rel="stylesheet" href="${this.baseUrl}/styles.css">
                <link rel="preload" href="${this.baseUrl}/font.woff2" as="font">
              </head>
              <body>
                <h1>AnimateLab Test Server</h1>
                <img src="${this.baseUrl}/image.png" alt="Test Image">
                <img srcset="${this.baseUrl}/dup1.png 1x, ${this.baseUrl}/dup2.png 2x">
                <script src="${this.baseUrl}/app.js"></script>
              </body>
            </html>
          `);
        } else if (pathname === '/styles.css') {
          res.writeHead(200, { 'Content-Type': 'text/css' });
          res.end(`
            @import url("${this.baseUrl}/css-import.css");
            @font-face { font-family: 'TestFont'; src: url('${this.baseUrl}/font.woff2'); }
            body { background-image: url("${this.baseUrl}/vector.svg"); }
          `);
        } else if (pathname === '/css-import.css') {
          res.writeHead(200, { 'Content-Type': 'text/css' });
          res.end('.imported { color: red; }');
        } else if (pathname === '/app.js') {
          res.writeHead(200, { 'Content-Type': 'application/javascript' });
          res.end(`console.log("App script loaded"); const model = "${this.baseUrl}/model.glb";`);
        } else if (pathname === '/image.png' || pathname === '/asset.png' || pathname === '/dup1.png' || pathname === '/dup2.png') {
          res.writeHead(200, { 'Content-Type': 'image/png' });
          res.end(Buffer.from('PNG_SIMULATED_BINARY_DATA_12345'));
        } else if (pathname === '/vector.svg') {
          res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
          res.end('<svg xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="5"/></svg>');
        } else if (pathname === '/font.woff2') {
          res.writeHead(200, { 'Content-Type': 'font/woff2' });
          res.end(Buffer.from('WOFF2_SIMULATED_FONT_DATA'));
        } else if (pathname === '/data.json') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'ok', items: [1, 2, 3] }));
        } else if (pathname === '/scene.gltf') {
          res.writeHead(200, { 'Content-Type': 'model/gltf+json' });
          res.end(JSON.stringify({
            asset: { version: '2.0' },
            buffers: [{ uri: `${this.baseUrl}/buffer.bin` }],
            images: [{ uri: `${this.baseUrl}/texture.png` }],
          }));
        } else if (pathname === '/buffer.bin') {
          res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
          res.end(Buffer.from('GLTF_BINARY_BUFFER_DATA'));
        } else if (pathname === '/texture.png') {
          res.writeHead(200, { 'Content-Type': 'image/png' });
          res.end(Buffer.from('TEXTURE_IMAGE_DATA'));
        } else if (pathname === '/model.glb') {
          res.writeHead(200, { 'Content-Type': 'model/gltf-binary' });
          res.end(Buffer.from('GLB_BINARY_CONTAINER_DATA'));
        } else if (pathname === '/large.bin') {
          // Large resource stream simulation (1MB)
          res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
          const chunk = Buffer.alloc(100 * 1024, 'A');
          for (let i = 0; i < 10; i++) {
            res.write(chunk);
          }
          res.end();
        } else if (pathname === '/protected.png') {
          const cookieHeader = req.headers['cookie'] || '';
          if (cookieHeader.includes('auth_session=secret_token')) {
            res.writeHead(200, { 'Content-Type': 'image/png' });
            res.end(Buffer.from('PROTECTED_PNG_DATA'));
          } else {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            res.end('Forbidden: Missing Auth Cookie');
          }
        } else if (pathname === '/res-redirect') {
          res.writeHead(302, { Location: `${this.baseUrl}/image.png` });
          res.end();
        } else if (pathname === '/res-404') {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Resource Not Found');
        } else if (pathname === '/res-403') {
          res.writeHead(403, { 'Content-Type': 'text/plain' });
          res.end('403 Forbidden');
        } else if (pathname === '/res-500') {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('500 Internal Server Error');
        } else if (pathname === '/res-slow') {
          setTimeout(() => {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Slow Resource Loaded');
          }, 600);
        } else if (pathname === '/abort-stream') {
          res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
          res.write(Buffer.from('PARTIAL_DATA_CHUNK'));
          setTimeout(() => {
            req.socket.destroy();
          }, 100);
        } else if (pathname === '/redirect') {
          res.writeHead(302, { Location: `${this.baseUrl}/redirected` });
          res.end();
        } else if (pathname === '/redirected') {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end('<html><head><title>Redirect Target</title></head><body><h1>Redirected Successfully</h1></body></html>');
        } else if (pathname === '/not-found') {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end('<html><head><title>Not Found</title></head><body><h1>404 Page Not Found</h1></body></html>');
        } else if (pathname === '/server-error') {
          res.writeHead(500, { 'Content-Type': 'text/html' });
          res.end('<html><head><title>Server Error</title></head><body><h1>500 Internal Error</h1></body></html>');
        } else if (pathname === '/set-cookies') {
          res.writeHead(200, {
            'Content-Type': 'text/html',
            'Set-Cookie': 'test_cookie=animatelab_val; Path=/',
          });
          res.end('<html><head><title>Cookie Set</title></head><body><h1>Cookie Test Page</h1></body></html>');
        } else if (pathname === '/storage-test') {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end('<html><head><title>Storage Test</title></head><body><script>localStorage.setItem("local_key","local_value");sessionStorage.setItem("session_key","session_value");</script></body></html>');
        } else if (pathname === '/console-error') {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end('<html><head><title>Console Error</title></head><body><script>console.error("Test console error output");</script></body></html>');
        } else if (pathname === '/page-error') {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end('<html><head><title>Page Error</title></head><body><script>throw new Error("Uncaught test page exception");</script></body></html>');
        } else if (pathname === '/spa-nav') {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end('<html><head><title>SPA Nav Test</title></head><body><script>document.addEventListener("DOMContentLoaded", () => { history.pushState({}, "Page 2", "/spa-nav/page2"); });</script></body></html>');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end('<html><body><h1>Default Page</h1></body></html>');
        }
      });

      this.server.listen(this.port, '127.0.0.1', () => {
        resolve(this.baseUrl);
      });

      this.server.on('error', (err) => reject(err));
    });
  }

  public async stop(): Promise<void> {
    if (this.server) {
      return new Promise((resolve) => {
        this.server!.close(() => resolve());
        this.server = null;
      });
    }
  }
}
