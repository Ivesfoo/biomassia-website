import functools
import http.server
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = 8765


class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass


handler = functools.partial(Handler, directory=ROOT)

# Threaded: a single-threaded server serialises requests, so one video stream
# blocks every other asset behind it and page loads crawl.
http.server.ThreadingHTTPServer.allow_reuse_address = True

with http.server.ThreadingHTTPServer(("127.0.0.1", PORT), handler) as httpd:
    print(f"Serving {ROOT} at http://127.0.0.1:{PORT}", flush=True)
    httpd.serve_forever()
