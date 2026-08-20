#!/bin/bash
# Mở demo SoloMatrix v3 "Gia Lai" — double-click file này là chạy.
cd "$(dirname "$0")" || exit 1
IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
PORT=8126
echo "════════════════════════════════════════════════════════"
echo "  SoloMatrix v3 — Kế nghiệp số Gia Lai"
echo "════════════════════════════════════════════════════════"
echo
echo "  Trên máy này:"
echo "     http://localhost:$PORT/mobile.html   ← ứng dụng của hộ"
echo "     http://localhost:$PORT/b2g.html      ← cổng Chương trình"
echo "     http://localhost:$PORT/index.html    ← hồ sơ giải pháp"
echo
if [ -n "$IP" ]; then
echo "  Trên ĐIỆN THOẠI (cùng Wi-Fi):"
echo "     http://$IP:$PORT/mobile.html"
echo "     → mở xong bấm Chia sẻ ⇧ → Thêm vào Màn hình chính"
echo
fi
echo "  Đóng cửa sổ này là tắt server."
echo "════════════════════════════════════════════════════════"
echo
sleep 1
open "http://localhost:$PORT/mobile.html"
python3 -m http.server $PORT
