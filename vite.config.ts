import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Alias für den `src`-Ordner
    },
  },
  build: {
    sourcemap: true, // Aktiviert Source Maps für Debugging
    minify: "terser", // Nutzt Terser für eine bessere Minifizierung
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name].[hash].js", // Dateihashing für JavaScript
        chunkFileNames: "assets/[name].[hash].js", // Dateihashing für Chunks
        assetFileNames: "assets/[name].[hash].[ext]", // Dateihashing für andere Ressourcen wie CSS/Images
        manualChunks: {
          vendor: ["react", "react-dom"], // Separiere Vendor-Bibliotheken wie React
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`, // Automatisches Importieren globaler SCSS-Variablen (optional)
      },
    },
  },
});