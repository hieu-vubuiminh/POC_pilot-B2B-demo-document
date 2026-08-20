#!/bin/bash
# run-build.sh <W0..W7> — chạy 1 agent GLM build cho chiến dịch v4. cwd = "QNSC - local".
set -u
ID="${1:?dùng: run-build.sh W0..W7}"
BASE="solomatrix-v3-gialai/docs/plan-v4"
[ -f "$BASE/de-build/$ID.md" ] || { echo "không có đề $ID" >&2; exit 2; }
PROMPT="$(cat "$BASE/de-build/_CHUNG-BUILD.md" "$BASE/de-build/$ID.md")"
case "$ID" in W1|W5|W6) MAXOUT=48000;; *) MAXOUT=32000;; esac
LOG="$BASE/logs/$ID.log"
echo "=== $ID start $(date '+%F %H:%M:%S') ===" >> "$LOG"
GLM_MAX_OUTPUT=$MAXOUT perl -e 'alarm 3600; exec @ARGV' -- \
  "$HOME/.claude/memory-sync/routines/glm-run.sh" -p "$PROMPT" \
  --allowedTools "Read,Grep,Glob,LS,Write,Edit,Task" --max-turns 80 \
  >> "$LOG" 2>&1
ST=$?
echo "=== $ID exit=$ST $(date '+%F %H:%M:%S') ===" >> "$LOG"
exit $ST
