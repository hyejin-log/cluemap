# [배포] 1단계: 작업 화면(React) 빌드 → 2단계: FastAPI로 서빙
FROM node:22-slim AS web
WORKDIR /web
COPY workspace/package.json workspace/package-lock.json ./
RUN npm ci
COPY workspace/ ./
RUN npm test && npm run build

FROM python:3.12-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8080
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY app/ ./app/
COPY --from=web /web/dist ./workspace/dist
EXPOSE 8080
CMD ["sh", "-c", "python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
