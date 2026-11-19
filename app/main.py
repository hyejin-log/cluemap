"""[배포] ClueMap 서버 — Rebate Lens와 같은 FastAPI 진입점(app.main:app)을 유지해요.

라우팅
- GET /healthz : 배포 플랫폼 상태 확인
- GET /        : 빌드된 작업 화면(workspace/dist/index.html)
- 그 밖의 경로  : dist 안의 정적 파일, 없으면 index.html로 돌려보내요(새로고침 대비)
"""

from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, JSONResponse

DIST = (Path(__file__).resolve().parent.parent / "workspace" / "dist").resolve()

app = FastAPI(title="ClueMap", docs_url=None, redoc_url=None, openapi_url=None)


@app.get("/healthz")
def healthz():
    return {"ok": True}


def _index() -> FileResponse:
    index = DIST / "index.html"
    if not index.is_file():
        # [유지보수 > 장애 대응] 프런트 빌드가 빠진 채 배포된 경우를 분명히 알려줘요.
        raise HTTPException(status_code=503, detail="작업 화면이 아직 빌드되지 않았어요. workspace 폴더에서 npm run build 를 실행해 주세요.")
    return FileResponse(index, headers={"Cache-Control": "no-cache"})


@app.get("/")
def index():
    return _index()


@app.get("/{path:path}")
def static_or_index(path: str):
    target = (DIST / path).resolve()
    # 경로 조작(../)으로 dist 밖 파일을 읽지 못하게 막아요.
    if target.is_relative_to(DIST) and target.is_file():
        cache = "public, max-age=31536000, immutable" if target.parent.name == "assets" else "no-cache"
        return FileResponse(target, headers={"Cache-Control": cache})
    if path.startswith(("api/", "assets/")) or Path(path).suffix:
        return JSONResponse({"detail": "찾는 파일이 없어요."}, status_code=404)
    return _index()
