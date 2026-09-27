import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Mounted under /bridge-course/ on the shared GitHub Pages site; relative base keeps
// asset URLs working regardless of the mount path (same as the sibling apps).
export default defineConfig({
    plugins: [react()],
    base: './',
    build: {
        // No source maps in production: nothing server-side is in the bundle anyway,
        // but there is no reason to publish them.
        sourcemap: false,
    },
});
