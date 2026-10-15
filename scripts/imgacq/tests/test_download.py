"""Download validation tests: signatures, HTML masquerades, corruption, size caps,
no-silent-substitution guarantee. All against local stub servers (no network)."""

import os
import pytest

from imgacq import download as dl
from imgacq.common import HttpError
from PIL import Image

import io


def jpeg_bytes(w=1600, h=900, color=(120, 40, 30)) -> bytes:
    im = Image.new("RGB", (w, h), color)
    # add a gradient so the bytes are realistically sized and dHash-safe
    from PIL import ImageDraw
    d = ImageDraw.Draw(im)
    for x in range(0, w, 8):
        d.line([(x, 0), (x, h)], fill=(min(255, x % 256), 60, 30))
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=85)
    return buf.getvalue()


def png_bytes(w=2000, h=1500) -> bytes:
    im = Image.new("RGB", (w, h), (10, 90, 140))
    from PIL import ImageDraw
    d = ImageDraw.Draw(im)
    for x in range(0, w, 16):
        d.line([(x, 0), (x, h)], fill=(20, min(255, x % 256), 160))
        d.line([(0, x % h), (w, x % h)], fill=(90, 40, min(255, x % 200)))
    buf = io.BytesIO()
    im.save(buf, "PNG")
    return buf.getvalue()


def serve(stub_server, path, body, ctype="image/jpeg"):
    base, H = stub_server
    H.routes[path] = (200, {"Content-Type": ctype}, body)
    return base


def test_valid_jpeg_downloads_and_validates(stub_server, tmp_path):
    base = serve(stub_server, "/img.jpg", jpeg_bytes())
    path, info = dl.fetch_media(base + "/img.jpg", str(tmp_path), "a")
    assert info["format"] == "JPEG" and info["width"] == 1600
    assert os.path.exists(path) and not os.path.exists(path + ".part")
    assert len(info["sha256"]) == 64


def test_html_masquerading_as_image_rejected(stub_server, tmp_path):
    page = "<html><body>error page</body></html>" + "\n" * 11000
    base = serve(stub_server, "/evil.jpg", page, ctype="image/jpeg")
    with pytest.raises(HttpError, match="masquerad|HTML"):
        dl.fetch_media(base + "/evil.jpg", str(tmp_path), "a")
    assert os.listdir(str(tmp_path)) == []      # nothing written


def test_html_content_type_rejected(stub_server, tmp_path):
    base = serve(stub_server, "/x", jpeg_bytes().decode("latin1"), ctype="text/html")
    with pytest.raises(HttpError):
        dl.fetch_media(base + "/x", str(tmp_path), "a")


def test_corrupt_image_rejected_by_decode(stub_server, tmp_path):
    real = jpeg_bytes()
    corrupt = real[: len(real) // 2] + b"\x00" * 11000   # truncated + padded, valid magic
    base = serve(stub_server, "/corrupt.jpg", corrupt)
    with pytest.raises(HttpError):
        dl.fetch_media(base + "/corrupt.jpg", str(tmp_path), "a")
    assert os.listdir(str(tmp_path)) == []


def test_oversize_rejected_via_content_length(stub_server, tmp_path, monkeypatch):
    monkeypatch.setattr(dl, "MAX_BYTES", 1000)
    base = serve(stub_server, "/big.jpg", jpeg_bytes())
    with pytest.raises(HttpError, match="cap"):
        dl.fetch_media(base + "/big.jpg", str(tmp_path), "a")


def test_undersize_image_rejected(stub_server, tmp_path):
    base = serve(stub_server, "/tiny.jpg", jpeg_bytes(300, 200))
    with pytest.raises(HttpError, match="too small"):
        dl.fetch_media(base + "/tiny.jpg", str(tmp_path), "a")


def test_unknown_signature_rejected(stub_server, tmp_path):
    base = serve(stub_server, "/weird.jpg", b"FCBEB0000000" + b"\x00" * 40000)
    with pytest.raises(HttpError, match="signature"):
        dl.fetch_media(base + "/weird.jpg", str(tmp_path), "a")


def test_404_raises_with_status(stub_server, tmp_path, no_sleep):
    base, _ = stub_server
    with pytest.raises(HttpError):
        dl.fetch_media(base + "/missing.jpg", str(tmp_path), "a", tries=1)


def test_png_signature_accepted(stub_server, tmp_path):
    base = serve(stub_server, "/img.png", png_bytes(), ctype="image/png")
    path, info = dl.fetch_media(base + "/img.png", str(tmp_path), "a")
    assert info["format"] == "PNG"


def test_download_failure_records_ledger_no_file(film, stub_server, no_sleep):
    """A failed download must be recorded and must not substitute any file."""
    base, H = stub_server
    cpath = __import__("imgacq.common", fromlist=["candidates_path"]).candidates_path(film)
    cand = {"id": "bad01", "provider": "commons", "query": "q",
            "media_url": base + "/gone.jpg", "source_page": "s", "title": "t",
            "creator": "", "date": "", "license": "Public domain", "license_url": "",
            "width": 0, "height": 0, "thumb_url": "", "mime": ""}
    __import__("imgacq.common", fromlist=["save_json"]).save_json(cpath, [cand])
    dl.download_candidates(film, limit=1)
    from imgacq.ledger import ledger
    lg = ledger(film)
    e = lg["entries"][0]
    assert e["status"] == "failed_download" and e["error"]
    incoming = os.path.join(film, "images", "incoming")
    assert not [f for f in os.listdir(incoming) if f.endswith((".jpg", ".png"))]
