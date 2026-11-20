# ClueMap · 현업 기준 추출 & 서류 빈칸 연결 보드

고객사 인터뷰 속 숨은 업무 기준을 규칙으로 뽑고, 서류 빈칸의 출처 누락과 부서별 용어 차이를 한눈에 맞추는
**Lattice FDE 현장 설계 보드**예요. Rebate Lens의 코드 구조(React + Vite + Tailwind 작업 화면, FastAPI 서버, Docker 배포)를
그대로 이어받고 화면 내용만 새로 만들었어요.

> 화면의 회사·인물·금액은 모두 시연용 가상 예시예요.

- 공개 주소: **https://cluemap.onrender.com** (무료 플랜이라 한동안 접속이 없으면 첫 화면이 30초~1분 늦게 떠요)

## 화면 구성

| 영역 | 하는 일 | 파일 |
|---|---|---|
| 상단 헤더 | 제목, 예시 미팅 전환(협력업체 계약 검토 / 외주 정산 및 검수) | `workspace/src/components/Header.jsx` |
| 요약 바 | 뽑아낸 규칙 · 출처 없는 빈칸 · 용어 차이 · 표준화 완료율 | `workspace/src/components/SummaryBar.jsx` |
| ① 규칙 뽑기 | 인터뷰 메모 → ‘만약 → 이렇게 처리’ 규칙 카드 → 확정하기 | `workspace/src/components/RuleExtractor.jsx` |
| ② 빈칸 출처 잇기 | 원본 자료 ──상태──▶ 서류 빈칸 가로 행, 출처 없는 행은 눌러서 질문 확인 | `workspace/src/components/SourceMap.jsx` |
| ③ 용어 맞추기 | 같은 단어를 부서마다 다른 단계에 쓰는 경우, 하나만 고르지 않고 일의 순서대로 단계 이름을 나눠 확정 (예: 계약 확정 → 견적 확정 → 서명 확정 → 입금 확정) | `workspace/src/components/TermAligner.jsx` |

- 예시 데이터: `workspace/src/data/scenarios.js`
- 규칙 추출기(브라우저 안에서만 동작, 외부 전송 없음): `workspace/src/lib/extractRules.js`
- 요약 지표 계산: `workspace/src/lib/progress.js`

**표준화 완료율** = 기준이 정해진 항목 ÷ 전체 항목 (항목 = 서류 빈칸 + 부서별 용어).
예시 1은 빈칸 10개(기본 빈칸 5 + 행 5) 중 8개, 용어 2개 중 0개가 정해져 있어 **8/12 = 67%**에서 시작해요.

## 실행

```powershell
cd workspace; npm install; npm run dev
```

서버까지 함께 확인하려면:

```powershell
cd workspace; npm run build; cd ..; pip install -r requirements-dev.txt; python -m uvicorn app.main:app --port 8080
```

## 테스트

```powershell
cd workspace; npm test
```

```powershell
python -m pytest
```

## 배포

`Dockerfile`이 작업 화면을 빌드(테스트 포함)한 뒤 FastAPI로 서빙해요. 상태 확인 경로는 `/healthz`예요.

- **Render**: `render.yaml`(Blueprint)로 배포해요. `main` 브랜치에 push 하면 자동으로 다시 배포돼요.
  무료 플랜은 15분 동안 접속이 없으면 잠들고, 다음 접속 때 깨어나느라 첫 화면이 30초~1분 늦게 뜰 수 있어요.
- `axhub.yaml`은 axhub에 올릴 때 쓰는 설정이에요(현재는 사용하지 않음).

## 브랜치

- `main`: 운영(배포) 브랜치
- `develop`: 개발 통합 브랜치
- `feature/*`: 기능 작업 → `develop`으로 합친 뒤 `main`으로 내보내요
