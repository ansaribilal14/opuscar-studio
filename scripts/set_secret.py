#!/usr/bin/env python3
"""Set a GitHub Actions secret on a repo via the API (libsodium sealed box).

Usage (never hardcode credentials in this file):
  GITHUB_TOKEN=ghp_xxx REPO=owner/name SECRET_NAME=NAME SECRET_VALUE=secret \
      python3 set_secret.py
"""
import base64, json, os, sys, urllib.request
from nacl import encoding, public

TOKEN = os.environ["GITHUB_TOKEN"]
REPO = os.environ["REPO"]
SECRET_NAME = os.environ["SECRET_NAME"]
SECRET_VALUE = os.environ["SECRET_VALUE"]


def req(url, data=None, method=None):
    r = urllib.request.Request(url, method=method)
    r.add_header("Authorization", f"token {TOKEN}")
    r.add_header("Accept", "application/vnd.github+json")
    body = json.dumps(data).encode() if data is not None else None
    with urllib.request.urlopen(r, body) as resp:
        raw = resp.read()
        return json.loads(raw) if raw else {}


pk = req(f"https://api.github.com/repos/{REPO}/actions/secrets/public-key")
recipient = public.PublicKey(pk["key"].encode(), encoding.Base64Encoder())
sealed = public.SealedBox(recipient).encrypt(SECRET_VALUE.encode())
enc = base64.b64encode(sealed).decode()
req(f"https://api.github.com/repos/{REPO}/actions/secrets/{SECRET_NAME}",
    data={"encrypted_value": enc, "key_id": pk["key_id"]}, method="PUT")
print(f"secret {SECRET_NAME} set on {REPO} (key_id {pk['key_id']})")
