import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import viteCompression from 'vite-plugin-compression'
import node from 'vite-plugin-node'
// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), viteCompression({algorithm: 'gzip', ext: '.gz'})],
  server: {
    port: '4040'
  }
})


