import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * SPA 가 아니라 MPA 로 빌드한다.
 *
 * /privacy 가 실제 파일이어야 하는 이유: Play Console 이 개인정보 처리방침 URL 을
 * 검증하는데, SPA 폴백이 어긋나면 심사에서 막힌다. 이 사이트의 존재 이유가 그
 * URL 이라 리다이렉트에 의존하지 않게 한다.
 */
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        privacy: resolve(import.meta.dirname, 'privacy/index.html'),
      },
    },
  },
});
