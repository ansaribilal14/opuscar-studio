#!/usr/bin/env python3
"""GitHub API helper for opuscar-studio shootout work. Token never printed."""
import json, os, subprocess, sys, urllib.request

REPO = "ansaribilal14/opuscar-studio"

def token():
    url = subprocess.run(["git","remote","get-url","origin"], capture_output=True,
                         text=True, cwd="/home/z/my-project").stdout.strip()
    cred = url.split("://",1)[1].split("@",1)[0]
    return cred.split(":")[-1]

def api(path, method="GET", body=None, raw=False):
    req = urllib.request.Request(f"https://api.github.com/repos/{REPO}/{path}",
        headers={"Authorization": f"token {token()}", "Accept": "application/vnd.github+json",
                 "User-Agent": "opuscar-shootout-agent"},
        data=json.dumps(body).encode() if body is not None else None, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            d = r.read().decode()
            return (r.status, d if raw else json.loads(d))
    except urllib.error.HTTPError as e:
        return (e.code, e.read().decode())

if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "list":
        for ep, kind in [("issues?state=all&per_page=30","iss"),("pulls?state=all&per_page=10","pr"),("releases?per_page=8","rel")]:
            st, d = api(ep)
            print(f"=== {kind} ({st}) ===")
            if isinstance(d, list):
                for i in d:
                    n = i.get("number","?"); t = i.get("title","")[:88]; s = i.get("state","")
                    extra = i.get("merged_at") or i.get("tag_name") or ""
                    print(f"  #{n} [{kind.upper()}] {s} {'('+extra+')' if extra else ''} | {t}")
    elif cmd == "get":
        st, d = api(sys.argv[2])
        print(json.dumps(d, indent=1)[:3000])
    elif cmd == "comment":  # comment <issue#> <file-with-body>
        with open(sys.argv[3]) as f: body = f.read()
        st, d = api(f"issues/{sys.argv[2]}/comments", "POST", {"body": body})
        print(st, d.get("html_url", d))
