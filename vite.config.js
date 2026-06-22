import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base must match the GitHub Pages project path (https://<user>.github.io/azulejo/)
export default defineConfig({
  base: '/azulejo/',
  plugins: [react(), tailwindcss()],
})
