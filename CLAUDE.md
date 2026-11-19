# ClueMap 프로젝트 메모

- 구조: `workspace/`(React 19 + Vite 6 + Tailwind 4) → 빌드 결과 `workspace/dist`를 `app/main.py`(FastAPI)가 서빙.
- 디자인 토큰은 `workspace/src/style.css`의 `@theme`에만 둬요 (ivory, memo, line, ink, muted, sage, mint, coral, blush).
  새 색을 하드코딩하지 말고 토큰을 써요.
- 여백 규칙: 카드 안쪽 p-6 이상, 컬럼·카드 사이 gap-6 이상. 매핑 화면에 곡선·교차선 금지(가로 행만).
- 화면 글은 처음 보는 사람도 이해할 쉬운 한국어로 써요. 회계·리베이트 용어를 다시 들이지 않아요.
- 예시 데이터는 `workspace/src/data/scenarios.js`, 지표 계산은 `workspace/src/lib/progress.js`.
- 확인: `cd workspace; npm test; npm run build` 와 루트에서 `python -m pytest`.
- 브랜치: main(운영) / develop(개발) / feature/*.
