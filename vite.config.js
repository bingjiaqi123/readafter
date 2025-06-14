import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        open: true,
        hmr: {
            overlay: true
        }
    },
    build: {
        sourcemap: true
    },
    optimizeDeps: {
        include: ['react', 'react-dom']
    }
});
