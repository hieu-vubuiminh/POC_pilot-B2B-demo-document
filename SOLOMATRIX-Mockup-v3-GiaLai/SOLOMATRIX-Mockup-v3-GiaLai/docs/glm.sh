#!/bin/bash
# Gọi z.ai GLM (endpoint Anthropic-compatible) — chỉ dùng khi Quang chỉ định.
# Dùng: ./glm.sh <prompt-file> <output-file> [model] [max_tokens]
set -euo pipefail
source ~/.claude/memory-sync/secrets/zai.env
PROMPT_FILE="$1"; OUT="$2"; MODEL="${3:-glm-5.2}"; MAXTOK="${4:-32000}"

python3 - "$PROMPT_FILE" "$MODEL" "$MAXTOK" > "$OUT.req.json" <<'PY'
import json,sys
p=open(sys.argv[1],encoding='utf-8').read()
print(json.dumps({"model":sys.argv[2],"max_tokens":int(sys.argv[3]),
 "messages":[{"role":"user","content":p}]}))
PY

curl -s --max-time 900 https://api.z.ai/api/anthropic/v1/messages \
  -H "x-api-key: $ZAI_API_KEY" -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  --data-binary "@$OUT.req.json" > "$OUT.raw.json"

python3 - "$OUT.raw.json" "$OUT" <<'PY'
import json,sys
d=json.load(open(sys.argv[1],encoding='utf-8'))
if 'content' not in d:
    print("ERROR:", json.dumps(d)[:600]); sys.exit(1)
txt="".join(b.get('text','') for b in d['content'] if b.get('type')=='text')
open(sys.argv[2],'w',encoding='utf-8').write(txt)
u=d.get('usage',{})
print(f"✅ {d.get('model')} · in {u.get('input_tokens')} / out {u.get('output_tokens')} tok · stop={d.get('stop_reason')} · {len(txt)} chars → {sys.argv[2]}")
PY
