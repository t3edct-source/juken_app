#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import argparse
from io import BytesIO
from PIL import Image, ImageOps

KB = 1024
JPEG_EXTS = {".jpg", ".jpeg"}
PNG_EXTS = {".png"}

def save_jpeg_bytes(img: Image.Image, quality: int) -> bytes:
    buf = BytesIO()
    img.save(buf, format="JPEG", quality=quality, optimize=True, progressive=True)
    return buf.getvalue()

def save_png_bytes(img: Image.Image) -> bytes:
    buf = BytesIO()
    img.save(buf, format="PNG", optimize=True, compress_level=9)
    return buf.getvalue()

def open_normalized(path: str) -> Image.Image:
    img = Image.open(path)
    return ImageOps.exif_transpose(img)

def flatten_alpha_to_rgb(img: Image.Image):
    if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
        bg = Image.new("RGB", img.size, (255, 255, 255))
        bg.paste(img.convert("RGBA"), mask=img.convert("RGBA").split()[-1])
        return bg
    return img.convert("RGB")

def resize_down(img: Image.Image, ratio=0.9):
    w, h = img.size
    return img.resize((int(w * ratio), int(h * ratio)), Image.LANCZOS)

# ---------- JPEG ----------
def compress_jpeg(path, max_kb):
    max_bytes = max_kb * KB
    img0 = flatten_alpha_to_rgb(open_normalized(path))
    cur = img0

    for _ in range(10):
        lo, hi = 30, 95
        best = None

        while lo <= hi:
            q = (lo + hi) // 2
            data = save_jpeg_bytes(cur, q)
            if len(data) <= max_bytes:
                best = data
                lo = q + 1
            else:
                hi = q - 1

        if best:
            return best

        cur = resize_down(cur)

    return save_jpeg_bytes(cur, 30)

# ---------- PNG ----------
def compress_png(path, max_kb):
    max_bytes = max_kb * KB
    img = open_normalized(path)

    data = save_png_bytes(img)
    if len(data) <= max_bytes:
        return data

    for colors in (256, 128, 64, 32):
        try:
            q = img.quantize(colors=colors, method=Image.MEDIANCUT)
            data = save_png_bytes(q)
            if len(data) <= max_bytes:
                return data
        except Exception:
            pass

    cur = img
    for _ in range(10):
        cur = resize_down(cur)
        data = save_png_bytes(cur)
        if len(data) <= max_bytes:
            return data

    return data

# ---------- main ----------
def main():
    ap = argparse.ArgumentParser(description="Compress images IN PLACE (overwrite originals)")
    ap.add_argument("folder", help="Target folder")
    ap.add_argument("--max-kb", type=int, default=200, help="Max size per image (KB)")
    ap.add_argument("--recursive", action="store_true", help="Process subfolders")
    args = ap.parse_args()

    def iter_files(root):
        if args.recursive:
            for d, _, files in os.walk(root):
                for f in files:
                    yield os.path.join(d, f)
        else:
            for f in os.listdir(root):
                yield os.path.join(root, f)

    count = 0
    for path in iter_files(args.folder):
        if not os.path.isfile(path):
            continue

        ext = os.path.splitext(path)[1].lower()
        try:
            if ext in JPEG_EXTS:
                data = compress_jpeg(path, args.max_kb)
            elif ext in PNG_EXTS:
                data = compress_png(path, args.max_kb)
            else:
                continue

            with open(path, "wb") as f:
                f.write(data)

            print(f"[OK] overwritten: {path}")
            count += 1

        except Exception as e:
            print(f"[SKIP] {path} ({e})")

    print(f"\nDone. processed={count}")

if __name__ == "__main__":
    main()
