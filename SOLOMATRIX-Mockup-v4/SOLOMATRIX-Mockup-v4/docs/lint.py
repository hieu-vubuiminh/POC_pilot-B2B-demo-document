#!/usr/bin/env python3
"""Cổng chất lượng tự động cho code GLM sinh ra.
Bắt 4 bệnh đã quan sát được: chữ Hán · tiếng Việt mất dấu · ES module · tài nguyên ngoài."""
import re, sys, pathlib, json

ROOT = pathlib.Path.home() / 'Downloads' / 'SOLOMATRIX-Mockup-v2'

# Từ tiếng Việt CHẮC CHẮN phải có dấu — thấy dạng không dấu là lỗi.
# Chỉ chọn từ mà dạng không dấu KHÔNG phải từ tiếng Anh hợp lệ.
BARE = ['khong', 'nguoi', 'duoc', 'chua', 'hoac', 'nhung', 'nhieu', 'thoi', 'gian',
        'tien', 'tien te', 'thue', 'hoa don', 'chuyen', 'nhan', 'gui', 'xoa', 'sua',
        'them', 'luu', 'tim', 'thay', 'trang', 'muc', 'gia tri', 'so luong', 'ngay',
        'thang', 'nam', 'tuan', 'viec', 'lam', 'xong', 'loi', 'canh bao', 'thanh cong',
        'that bai', 'dang', 'da ', 'se ', 'phai', 'can ', 'chi ', 'moi ', 'cu ',
        'duyet', 'tu choi', 'ket noi', 'du lieu', 'he thong', 'nguoi dung', 'khach hang',
        'don hang', 'ton kho', 'bao cao', 'nhat ky', 'quyen', 'vai tro', 'tai khoan']
BARE_RE = re.compile(r'\b(' + '|'.join(re.escape(w.strip()) for w in sorted(set(BARE), key=len, reverse=True)) + r')\b', re.I)

CJK_RE = re.compile(r'[一-鿿぀-ヿ가-힯]')
ACCENT_RE = re.compile(r'[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]', re.I)

def strings_and_comments(src):
    """Trả về (dòng, nội dung) của mọi chuỗi ký tự và comment."""
    out = []
    for i, line in enumerate(src.split('\n'), 1):
        for m in re.finditer(r"'([^'\\\n]{6,})'|\"([^\"\\\n]{6,})\"|`([^`\\]{6,})`", line):
            out.append((i, m.group(1) or m.group(2) or m.group(3), 'chuỗi'))
        c = re.search(r'//\s*(.{6,})|/\*\s*(.{6,}?)\*/', line)
        if c:
            out.append((i, (c.group(1) or c.group(2) or '').strip(), 'comment'))
    return out

def lint_file(p):
    src = p.read_text(encoding='utf-8')
    iss = []
    for m in CJK_RE.finditer(src):
        ln = src[:m.start()].count('\n') + 1
        iss.append(('CJK', ln, f'ký tự {m.group()}'))
        if len(iss) > 5: break
    if p.suffix in ('.js', '.html'):
        if re.search(r'^\s*(import|export)\s+[\w{*]', src, re.M) or 'type="module"' in src:
            iss.append(('ESMODULE', 0, 'dùng ES module — sẽ chết khi mở bằng file://'))
        for m in re.finditer(r'(?:src|href)\s*=\s*["\'](https?:)?//[^"\']+', src):
            iss.append(('NGOAI', src[:m.start()].count('\n') + 1, m.group()[:60]))
    for ln, txt, kind in strings_and_comments(src):
        if ACCENT_RE.search(txt) or CJK_RE.search(txt):
            continue                                     # đã có dấu → bỏ qua
        if kind == 'chuỗi' and ' ' not in txt.strip():
            continue                                     # định danh/khoá (vd 'nang.cvp.chuyen-viec') — không phải chữ hiển thị
        hits = BARE_RE.findall(txt)
        if len(hits) >= 2:                               # ≥2 từ mất dấu mới tính, tránh báo nhầm
            iss.append(('MATDAU', ln, f'{kind}: "{txt[:60]}" ← {hits[:4]}'))
    return iss

targets = []
for pat in ('*.html', 'js/*.js'):
    targets += sorted(ROOT.glob(pat))
if len(sys.argv) > 1:
    targets = [ROOT / a for a in sys.argv[1:]]

total = 0
report = []
for p in targets:
    iss = lint_file(p)
    if not iss: continue
    by = {}
    for k, ln, d in iss: by.setdefault(k, []).append((ln, d))
    report.append(f"\n### `{p.relative_to(ROOT)}` — {len(iss)} vấn đề")
    for k, v in by.items():
        report.append(f"- **{k}** ({len(v)}): " + "; ".join(f"dòng {ln} {d}" for ln, d in v[:8]))
        if len(v) > 8: report.append(f"  …và {len(v)-8} chỗ nữa")
    total += len(iss)

txt = (f"# LINT — {total} vấn đề\n" + "\n".join(report)) if total else "# LINT — sạch, 0 vấn đề\n"
(ROOT / 'docs' / 'LINT.md').write_text(txt, encoding='utf-8')
print(txt if total else "✅ lint sạch")
sys.exit(1 if total else 0)
