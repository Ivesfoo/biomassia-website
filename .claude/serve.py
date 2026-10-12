import functools
import http.server
import os
import socketserver

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = 8765


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


socketserver.TCPServer.allow_reuse_address = True
handler = functools.partial(Handler, directory=ROOT)

with socketserver.TCPServer(("127.0.0.1", PORT), handler) as httpd:
    print(f"Serving {ROOT} at http://127.0.0.1:{PORT}", flush=True)
    httpd.serve_forever()
