#!/usr/bin/env python3
"""Pre-push check for the AlKhwarizmi site.

    python3 tools/check-pages.py

Two jobs, both guarding failures that are invisible in a browser:

1. LINKS AND ASSETS. Every href, src and data-logo-* is resolved and its target
   asserted to exist. A dead #fragment does nothing at all when clicked -- no
   error, no console warning, the page just sits there -- and a wrong
   data-logo-* path only shows up as a broken image after a language toggle.

2. CHROME SYNC. The site has no build step, so the nav and footer exist as five
   hand-maintained copies that differ only in link depth (../assets/,
   ../about/). Edit one and forget the others and the site quietly disagrees
   with itself. This normalises the depth away and asserts all five match.

Exit code 0 means safe to push.
"""
import io
import os
import re
import sys
from urllib.parse import urldefrag

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES = [
    "index.html",
    "about/index.html",
    "programs/index.html",
    "summer-camp/index.html",
    "sponsor/index.html",
]
SKIP_SCHEMES = ("mailto:", "tel:", "http://", "https://", "data:", "#")
ATTR = re.compile(r'\b(href|src|data-logo-en|data-logo-ar)="([^"]*)"')

fails = []


def fail(msg):
    fails.append(msg)


def load(rel):
    path = os.path.join(ROOT, rel)
    if not os.path.isfile(path):
        fail("missing page: " + rel)
        return None
    return io.open(path, encoding="utf-8").read()


docs = {rel: load(rel) for rel in PAGES}
if any(d is None for d in docs.values()):
    print("\n".join(fails))
    sys.exit(1)

ids = {rel: set(re.findall(r'\bid="([^"]+)"', d)) for rel, d in docs.items()}


# ------------------------------------------------------- 1. links + assets
checked = 0
for rel, doc in docs.items():
    pagedir = os.path.dirname(os.path.join(ROOT, rel))
    for attr, val in ATTR.findall(doc):
        if not val or val.startswith(SKIP_SCHEMES[:-1]):
            continue
        checked += 1
        path, frag = urldefrag(val)
        path = path.split("?")[0]                     # ?cat=kids is a filter, not a file

        if path == "":                                # same-page fragment
            if frag not in ids[rel]:
                fail('%s: %s="%s" -> no #%s on this page' % (rel, attr, val, frag))
            continue

        target = os.path.normpath(os.path.join(pagedir, path))
        if os.path.isdir(target):
            target = os.path.join(target, "index.html")
        if not os.path.isfile(target):
            fail('%s: %s="%s" -> missing %s' % (rel, attr, val, os.path.relpath(target, ROOT)))
            continue
        if frag:
            trel = os.path.relpath(target, ROOT)
            tids = ids.get(trel)
            if tids is None:
                tids = set(re.findall(r'\bid="([^"]+)"',
                                      io.open(target, encoding="utf-8").read()))
            if frag not in tids:
                fail('%s: %s="%s" -> %s has no #%s' % (rel, attr, val, trel, frag))


# --------------------------------------------------------- 2. chrome sync
def grab(doc, open_tag, close_tag):
    a = doc.find(open_tag)
    b = doc.find(close_tag)
    if a == -1 or b == -1:
        return None
    return doc[a:b + len(close_tag)]


def normalise(block, rel):
    """Strip everything that legitimately differs between copies."""
    # link depth
    block = block.replace('="../', '="')
    if rel != "index.html":
        block = block.replace('href="index.html"', 'href="#top"')
    # the page marks its own nav item, and Enroll points at the nearest form
    block = block.replace(' aria-current="page"', "")
    block = re.sub(r'href="(?:programs/)?#register"', 'href="#register"', block)
    return re.sub(r"\s+", " ", block).strip()


for tag_open, tag_close, label in (("<header id=\"wa-nav\">", "</header>", "nav"),
                                   ("<footer id=\"contact\">", "</footer>", "footer")):
    ref_rel, ref = None, None
    for rel, doc in docs.items():
        blk = grab(doc, tag_open, tag_close)
        if blk is None:
            fail("%s: no %s block" % (rel, label))
            continue
        norm = normalise(blk, rel)
        if ref is None:
            ref_rel, ref = rel, norm
        elif norm != ref:
            # show the first divergence rather than dumping both blocks
            i = next((k for k in range(min(len(ref), len(norm))) if ref[k] != norm[k]),
                     min(len(ref), len(norm)))
            fail("%s %s differs from %s near: ...%s..." % (rel, label, ref_rel, norm[max(0, i - 60):i + 60]))


# ---------------------------------------------------------------- report
print("checked %d references across %d pages" % (checked, len(docs)))
if fails:
    print("\n%d PROBLEM(S):" % len(fails))
    for f in fails:
        print("  " + f)
    sys.exit(1)
print("links resolve; nav and footer are in sync across all %d pages" % len(docs))
