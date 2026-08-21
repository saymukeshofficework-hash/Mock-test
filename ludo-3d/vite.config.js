import { defineConfig } from 'vite';

// Relative base so the production build works when hosted at
// https://USERNAME.github.io/REPOSITORY/  (or any sub-path, or at the
// domain root) without needing to hard-code the repository name.
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020'
  },
  server: {
    port: 5173,
    open: false
  }
});
