#!/usr/bin/env python3
"""Stamp your real domain across the project in one go.

Usage:
    python3 set-domain.py https://your-domain.com
"""
import sys, pathlib

OLD = "https://aiversedaily.com"
if len(sys.argv) != 2:
    print("Usage: python3 set-domain.py https://your-domain.com"); sys.exit(1)
new = sys.argv[1].rstrip("/")

files = ["index.html", "robots.txt", "sitemap.xml", "content.js", "404.html"]
changed = 0
for f in files:
    p = pathlib.Path(f)
    if not p.exists():
        continue
    t = p.read_text(encoding="utf-8")
    if OLD in t:
        p.write_text(t.replace(OLD, new), encoding="utf-8")
        changed += 1
        print(f"updated {f}")
print(f"\nDone — {new} stamped into {changed} file(s).")
print("Now re-deploy (e.g. `vercel --prod` or `git push`).")
