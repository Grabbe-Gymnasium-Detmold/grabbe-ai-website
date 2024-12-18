import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    middlewareMode: true,
    headers: {
      'X-Frame-Options': 'ALLOWALL', // Oder setze einen anderen Wert
    },
  },
})