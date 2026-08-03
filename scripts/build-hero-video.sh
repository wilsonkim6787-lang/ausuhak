#!/usr/bin/env bash
# Hero 배경 영상 제작 파이프라인 (Flow/Veo 클립 → 웹용 루프 영상)
#
# 사용법:
#   1) Flow에서 뽑은 클립들을 한 폴더에 넣는다 (재생 순서대로 01.mp4, 02.mp4 …)
#   2) ./scripts/build-hero-video.sh <클립폴더>
#   3) 결과물 public/videos/hero.mp4 확인 후 커밋
#
# 하는 일:
#   - 클립들을 1초 크로스페이드로 이어붙여 하나의 루프 영상 생성
#   - 1920px 폭으로 리사이즈, H.264 압축(crf 28), 오디오 제거, faststart
#   - 목표 용량 ~3-5MB (넘으면 CRF를 30-32로 올려 재실행)
set -euo pipefail

SRC_DIR="${1:?사용법: build-hero-video.sh <클립폴더>}"
OUT="public/videos/hero.mp4"
FADE=1 # 크로스페이드 길이(초)

mapfile -t CLIPS < <(find "$SRC_DIR" -maxdepth 1 -name '*.mp4' | sort)
N=${#CLIPS[@]}
[ "$N" -ge 1 ] || { echo "mp4 클립이 없습니다: $SRC_DIR"; exit 1; }
echo "클립 ${N}개: ${CLIPS[*]}"

mkdir -p public/videos

if [ "$N" -eq 1 ]; then
  ffmpeg -y -i "${CLIPS[0]}" -an \
    -vf "scale=1920:-2:flags=lanczos,fps=30" \
    -c:v libx264 -preset slow -crf 28 -pix_fmt yuv420p -movflags +faststart \
    "$OUT"
else
  # N개 클립 xfade 체인 구성
  INPUTS=(); for c in "${CLIPS[@]}"; do INPUTS+=(-i "$c"); done
  FILTER=""; PREV="[0:v]"; OFFSET=0
  for i in $(seq 1 $((N - 1))); do
    DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "${CLIPS[$((i - 1))]}")
    OFFSET=$(python3 -c "print(round(${OFFSET} + ${DUR} - ${FADE}, 3))")
    LABEL="[x${i}]"
    FILTER+="${PREV}[${i}:v]xfade=transition=fade:duration=${FADE}:offset=${OFFSET}${LABEL};"
    PREV="$LABEL"
  done
  FILTER+="${PREV}scale=1920:-2:flags=lanczos,fps=30[v]"
  ffmpeg -y "${INPUTS[@]}" -filter_complex "$FILTER" -map "[v]" -an \
    -c:v libx264 -preset slow -crf 28 -pix_fmt yuv420p -movflags +faststart \
    "$OUT"
fi

SIZE=$(du -h "$OUT" | cut -f1)
echo "완료: $OUT ($SIZE) — 5MB 초과 시 CRF 30-32로 올려 재실행 권장"
