#!/usr/bin/env python3
"""Local dev server for The Shape of Maybe.

Plain `python3 -m http.server` lets the browser cache ES modules, so an edit can
sit invisible behind a stale copy. This one tells the browser to keep nothing,
which is what you want while writing and never in production.

    python3 tools/serve.py [port]
"""

import functools
import http.server
import os
import sys


class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):  # quiet: only errors reach the terminal
        if not args or not str(args[0]).startswith(("GET", "HEAD")):
            super().log_message(fmt, *args)


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    handler = functools.partial(NoCache, directory=root)
    with http.server.ThreadingHTTPServer(("127.0.0.1", port), handler) as httpd:
        print(f"The Shape of Maybe — http://127.0.0.1:{port}  (serving {root})")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nstopped")


if __name__ == "__main__":
    main()
