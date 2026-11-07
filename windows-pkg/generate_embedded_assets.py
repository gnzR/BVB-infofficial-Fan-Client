#!/usr/bin/env python3
import os
import re

dist_dir = "/app/applet/dist"
ico_path = "/app/applet/windows-pkg/bvb09.ico"
out_header = "/app/applet/windows-pkg/src/embedded_assets.h"

MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".ico": "image/x-icon",
    ".svg": "image/svg+xml",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
}

def get_mime(filename):
    _, ext = os.path.splitext(filename.lower())
    return MIME_TYPES.get(ext, "application/octet-stream")

def to_c_ident(rel_path):
    return "ASSET_" + re.sub(r"[^a-zA-Z0-9]", "_", rel_path).upper()

def format_byte_array(data):
    lines = []
    chunk_size = 24
    for i in range(0, len(data), chunk_size):
        chunk = data[i:i + chunk_size]
        lines.append("    " + ", ".join(f"0x{b:02x}" for b in chunk))
    return ",\n".join(lines)

assets = []
for root, _, files in os.walk(dist_dir):
    for f in sorted(files):
        full = os.path.join(root, f)
        rel = os.path.relpath(full, dist_dir).replace("\\", "/")
        if rel.startswith("assets/aistudio"):
            continue
        if rel.endswith(".exe") or rel.endswith(".zip") or rel.endswith(".tar.gz"):
            continue
        with open(full, "rb") as fp:
            raw = fp.read()
        if rel == "index.html":
            text = raw.decode("utf-8", errors="ignore")
            text = re.sub(r'\scrossorigin(="[^"]*")?', "", text)
            raw = text.encode("utf-8")
        assets.append((rel, "/" + rel, get_mime(rel), to_c_ident(rel), raw))

with open(ico_path, "rb") as fp:
    ico_data = fp.read()

with open(out_header, "w", encoding="utf-8") as out:
    out.write("/* Auto-generated embedded frontend assets for BVB 09 Windows Client */\n")
    out.write("#ifndef EMBEDDED_ASSETS_H\n")
    out.write("#define EMBEDDED_ASSETS_H\n\n")
    out.write("#include <stddef.h>\n\n")
    out.write("typedef struct {\n")
    out.write("    const char *url_path;\n")
    out.write("    const char *rel_file;\n")
    out.write("    const char *mime_type;\n")
    out.write("    const unsigned char *data;\n")
    out.write("    unsigned int size;\n")
    out.write("} EmbeddedAsset;\n\n")

    for rel, url_path, mime, ident, raw in assets:
        out.write(f"static const unsigned char {ident}[{len(raw)}] = {{\n")
        out.write(format_byte_array(raw))
        out.write("\n};\n\n")

    out.write(f"static const unsigned char EMBEDDED_ICO_DATA[{len(ico_data)}] = {{\n")
    out.write(format_byte_array(ico_data))
    out.write("\n};\n")
    out.write(f"static const unsigned int EMBEDDED_ICO_SIZE = {len(ico_data)};\n\n")

    out.write(f"static const EmbeddedAsset EMBEDDED_ASSETS[{len(assets)}] = {{\n")
    for rel, url_path, mime, ident, raw in assets:
        out.write(f'    {{ "{url_path}", "{rel}", "{mime}", {ident}, {len(raw)} }},\n')
    out.write("};\n")
    out.write(f"static const int EMBEDDED_ASSETS_COUNT = {len(assets)};\n\n")
    out.write("#endif /* EMBEDDED_ASSETS_H */\n")

print(f"Generated {out_header} with {len(assets)} assets ({sum(len(a[4]) for a in assets)} bytes total).")
