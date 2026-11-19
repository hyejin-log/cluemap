// [배포] Vite 빌드 설정 — 결과물(dist)은 FastAPI(app/main.py)가 그대로 서빙해요.
import tailwind from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwind()],
});
