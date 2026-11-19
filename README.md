# ClueMap · 현업 기준 추출 & 서류 빈칸 연결 보드

고객사 인터뷰 속 숨은 업무 기준을 규칙으로 뽑고, 서류 빈칸의 출처 누락과 부서별 용어 차이를 한눈에 맞추는
**Lattice FDE 현장 설계 보드**예요. Rebate Lens의 코드 구조(React + Vite + Tailwind 작업 화면, FastAPI 서버, Docker 배포)를
그대로 이어받고 화면 내용만 새로 만들었어요.

> 화면의 회사·인물·금액은 모두 시연용 가상 예시예요.

## 화면 구성

| 영역 | 하는 일 | 파일 |
|---|---|---|
| 상단 헤더 | 제목, 예시 미팅 전환(협력업체 계약 검토 / 외주 정산 및 검수) | `workspace/src/components/Header.jsx` |
| 요약 바 | 뽑아낸 규칙 · 출처 없는 빈칸 · 용어 차이 · 표준화 완료율 | `workspace/src/components/SummaryBar.jsx` |
| ① 규칙 뽑기 | 인터뷰 메모 → ‘만약 → 이렇게 처리’ 규칙 카드 → 확정하기 | `workspace/src/components/RuleExtractor.jsx` |
| ② 빈칸 출처 잇기 | 원본 자료 ──상태──▶ 서류 빈칸 가로 행, 출처 없는 행은 눌러서 질문 확인 | `workspace/src/components/SourceMap.jsx` |
| ③ 용어 맞추기 | 부서별 뜻 중 대표 뜻을 골라 회사 표준으로 확정 | `workspace/src/components/TermAligner.jsx` |

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

`Dockerfile`이 작업 화면을 빌드(테스트 포함)한 뒤 FastAPI로 서빙해요. `axhub.yaml`의 상태 확인 경로는 `/healthz`예요.

## 브랜치

- `main`: 운영(배포) 브랜치
- `develop`: 개발 통합 브랜치
- `feature/*`: 기능 작업 → `develop`으로 합친 뒤 `main`으로 내보내요
