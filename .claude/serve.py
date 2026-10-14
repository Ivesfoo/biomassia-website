import functools
import http.server
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = 8765


class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass

    def end_headers(self):
        # no-cache, not no-store: the browser must revalidate every request, so
        # edits always show, but unchanged files come back as a cheap 304 rather
        # than being re-downloaded. Sending nothing at all lets Chrome cache
        # heuristically and serve stale pages after an edit.
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()


handler = functools.partial(Handler, directory=ROOT)

# Threaded: a single-threaded server serialises requests, so one video stream
# blocks every other asset behind it and page loads crawl.
http.server.ThreadingHTTPServer.allow_reuse_address = True

with http.server.ThreadingHTTPServer(("127.0.0.1", PORT), handler) as httpd:
    print(f"Serving {ROOT} at http://127.0.0.1:{PORT}", flush=True)
    httpd.serve_forever()
