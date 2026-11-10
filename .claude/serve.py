import functools
import http.server
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = 8765


class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass

    # Source files are edited constantly, so they must never be served from
    # cache: "no-cache" only asks for revalidation, and a 304 slipped through
    # often enough to hide a change and send us debugging a phantom bug.
    # Media is large and does not change, so it keeps the cheap revalidation.
    NO_STORE = (".html", ".css", ".js", ".json", ".svg")

    def end_headers(self):
        path = self.path.split("?", 1)[0]
        if path.endswith("/") or path.lower().endswith(self.NO_STORE):
            self.send_header("Cache-Control", "no-store, max-age=0")
        else:
            self.send_header("Cache-Control", "no-cache")
        super().end_headers()


handler = functools.partial(Handler, directory=ROOT)

# Threaded: a single-threaded server serialises requests, so one video stream
# blocks every other asset behind it and page loads crawl.
http.server.ThreadingHTTPServer.allow_reuse_address = True

with http.server.ThreadingHTTPServer(("127.0.0.1", PORT), handler) as httpd:
    print(f"Serving {ROOT} at http://127.0.0.1:{PORT}", flush=True)
    httpd.serve_forever()
