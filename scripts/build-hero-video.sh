#!/usr/bin/env bash
# Hero 배경 영상 제작 파이프라인 (Flow/Veo 클립 → 웹용 무한 루프 영상)
#
# 사용법:
#   1) Flow에서 뽑은 클립들을 한 폴더에 넣는다 (재생 순서대로 01.mp4, 02.mp4 …)
#   2) ./scripts/build-hero-video.sh <클립폴더>
#   3) 결과물 public/videos/hero.mp4 확인 후 커밋
#
# 하는 일:
#   - 클립들을 1초 크로스페이드로 이어붙인 뒤, 영상 끝을 시작 지점으로
#     한 번 더 크로스페이드해 하드컷 없는 완전 루프를 만든다
#   - 24fps 통일, 소스 해상도 유지(폭 1920px 초과 시에만 축소), 오디오 제거
#   - H.264 압축(기본 CRF 30, `CRF=32 ./scripts/…` 로 조정), faststart
#   - 목표 용량 ~3-5MB
set -euo pipefail

SRC_DIR="${1:?사용법: build-hero-video.sh <클립폴더>}"
OUT="public/videos/hero.mp4"
FADE=1 # 크로스페이드 길이(초)
CRF="${CRF:-30}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

mapfile -t CLIPS < <(find "$SRC_DIR" -maxdepth 1 -name '*.mp4' | sort)
N=${#CLIPS[@]}
[ "$N" -ge 1 ] || { echo "mp4 클립이 없습니다: $SRC_DIR"; exit 1; }
echo "클립 ${N}개: ${CLIPS[*]}"

mkdir -p public/videos

# 1) 클립 정규화(24fps·최대 1920px 폭) 후 크로스페이드 체인 → 고화질 중간 파일
INPUTS=(); for c in "${CLIPS[@]}"; do INPUTS+=(-i "$c"); done
FILTER=""
for i in $(seq 0 $((N - 1))); do
  FILTER+="[${i}:v]fps=24,scale='min(1920,iw)':-2:flags=lanczos,settb=AVTB[p${i}];"
done
TOTAL=0; PREV="[p0]"
for i in $(seq 1 $((N - 1))); do
  DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "${CLIPS[$((i - 1))]}")
  TOTAL=$(python3 -c "print(round(${TOTAL} + ${DUR} - ${FADE}, 3))")
  LABEL="[x${i}]"
  FILTER+="${PREV}[p${i}]xfade=transition=fade:duration=${FADE}:offset=${TOTAL}${LABEL};"
  PREV="$LABEL"
done
LAST_DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "${CLIPS[$((N - 1))]}")
TOTAL=$(python3 -c "print(round(${TOTAL} + ${LAST_DUR}, 3))")
ffmpeg -y "${INPUTS[@]}" -filter_complex "${FILTER%;}" -map "$PREV" -an \
  -c:v libx264 -preset fast -crf 16 -pix_fmt yuv420p "$TMP/chain.mp4"

# 2) 끝→시작 크로스페이드로 이음새 없는 루프 구간 추출 + 최종 압축
#    xfade(체인, 체인, offset=길이-FADE) 뒤 [FADE, 길이] 구간을 취하면
#    시작·끝 프레임이 일치하는 루프가 된다
WRAP=$(python3 -c "print(round(${TOTAL} - ${FADE}, 3))")
ffmpeg -y -i "$TMP/chain.mp4" -i "$TMP/chain.mp4" \
  -filter_complex "[0:v][1:v]xfade=transition=fade:duration=${FADE}:offset=${WRAP},trim=start=${FADE}:end=${TOTAL},setpts=PTS-STARTPTS[v]" \
  -map "[v]" -an -c:v libx264 -preset slow -crf "$CRF" -pix_fmt yuv420p -movflags +faststart "$OUT"

SIZE=$(du -h "$OUT" | cut -f1)
echo "완료: $OUT ($SIZE, 루프 ${WRAP}초) — 5MB 초과 시 CRF=32로 재실행 권장"
