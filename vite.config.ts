import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [TanStackRouterVite({ target: "react", autoCodeSplitting: true }), react(), tailwindcss(), tsconfigPaths()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Base commune à toutes les pages ; le reste est chargé page par page.
          if (/node_modules[\\/](react|react-dom|scheduler|@tanstack|@supabase)[\\/]/.test(id)) {
            return 'vendor';
          }
          if (id.includes('components/commerce/PageBlocks') || id.includes('components\\commerce\\PageBlocks')) {
            return 'pageblocks';
          }
        },
      },
    },
  },
});
