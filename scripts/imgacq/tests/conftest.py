"""Shared fixtures: local stub HTTP servers (no external network) and a temp film tree."""

import http.server
import json
import os
import socket
import sys
import threading
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.dont_write_bytecode = True

from imgacq import common as cm   # noqa: E402


class Handler(http.server.BaseHTTPRequestHandler):
    routes = {}          # class attr: (path) -> (status, headers, body)
    calls = []

    def do_GET(self):
        Handler.calls.append(self.path)
        entry = Handler.routes.get(self.path.split("?")[0])
        if entry is None:
            self.send_error(404)
            return
        status, headers, body = entry
        if callable(body):
            body = body(self)
        if isinstance(body, (dict, list)):
            body = json.dumps(body).encode()
        elif isinstance(body, str):
            body = body.encode()
        self.send_response(status)
        for k, v in (headers or {}).items():
            self.send_header(k, v)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *_a):
        pass


@pytest.fixture
def stub_server():
    """Start a localhost HTTP server with programmable routes; yield base URL."""
    Handler.routes = {}
    Handler.calls = []
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    t = threading.Thread(target=srv.serve_forever, daemon=True)
    t.start()
    yield f"http://127.0.0.1:{srv.server_port}", Handler
    srv.shutdown()


@pytest.fixture
def no_sleep(monkeypatch):
    monkeypatch.setattr(cm, "SLEEP", lambda *_: None)


@pytest.fixture
def film(tmp_path):
    """A minimal fake film tree: work/<name>/src/scene_briefs.json + images/."""
    name = "video-test-film"
    root = tmp_path / "work" / name
    (root / "src").mkdir(parents=True)
    (root / "images").mkdir()
    briefs = {"film": name, "rev": "test", "hierarchy": "test", "briefs": {
        "b1": {"visual": "tent_find", "photos": ["tent_1959.jpg"],
               "fallback": "recon_tent", "why": "the 1959 discovery tent"},
        "b2": {"visual": "roster", "photos": [], "fallback": "roster_card"},
    }}
    (root / "src" / "scene_briefs.json").write_text(json.dumps(briefs))
    # redirect the module's WORK_DIR at the tmp tree
    orig = cm.WORK_DIR
    cm.WORK_DIR = str(tmp_path / "work")
    yield str(root)
    cm.WORK_DIR = orig
