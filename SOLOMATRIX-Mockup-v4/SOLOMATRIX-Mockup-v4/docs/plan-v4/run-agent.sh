#!/bin/bash
# run-agent.sh <T1..T6> — chạy 1 agent GLM planning cho chiến dịch PLAN v4.
# BẮT BUỘC chạy với cwd = "/Users/quangle/QNSC - local" (thư mục đã trust trong ~/.claude-glm).
# GLM lỗi/rỗng thì glm-run.sh tự failover về Claude (ghi ENGINE-FALLBACK trong log).
set -u
ID="${1:?dùng: run-agent.sh T1..T6}"
BASE="solomatrix-v3-gialai/docs/plan-v4"
[ -f "$BASE/de/$ID.md" ] || { echo "không có đề $ID" >&2; exit 2; }
PROMPT="$(cat "$BASE/de/_CHUNG.md" "$BASE/de/$ID.md")"
MAXOUT=32000; [ "$ID" = "T6" ] && MAXOUT=48000
LOG="$BASE/logs/$ID.log"
echo "=== $ID start $(date '+%F %H:%M:%S') ===" >> "$LOG"
# perl alarm = timeout 45' chống treo (máy không có lệnh timeout; alarm sống qua exec)
GLM_MAX_OUTPUT=$MAXOUT perl -e 'alarm 2700; exec @ARGV' -- \
  "$HOME/.claude/memory-sync/routines/glm-run.sh" -p "$PROMPT" \
  --allowedTools "Read,Grep,Glob,LS,Write,Task" --max-turns 60 \
  >> "$LOG" 2>&1
ST=$?
echo "=== $ID exit=$ST $(date '+%F %H:%M:%S') ===" >> "$LOG"
exit $ST
