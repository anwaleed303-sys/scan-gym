// vite.config.ts
import { defineConfig } from "file:///C:/Users/sk%20computers/OneDrive/Desktop/Scan%20Gym%20Project/scan-gym/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/sk%20computers/OneDrive/Desktop/Scan%20Gym%20Project/scan-gym/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/Users/sk%20computers/OneDrive/Desktop/Scan%20Gym%20Project/scan-gym/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\sk computers\\OneDrive\\Desktop\\Scan Gym Project\\scan-gym";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [
    react(),
    mode === "development" ? componentTagger() : null
  ].filter((plugin) => plugin !== null),
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxzayBjb21wdXRlcnNcXFxcT25lRHJpdmVcXFxcRGVza3RvcFxcXFxTY2FuIEd5bSBQcm9qZWN0XFxcXHNjYW4tZ3ltXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxzayBjb21wdXRlcnNcXFxcT25lRHJpdmVcXFxcRGVza3RvcFxcXFxTY2FuIEd5bSBQcm9qZWN0XFxcXHNjYW4tZ3ltXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9zayUyMGNvbXB1dGVycy9PbmVEcml2ZS9EZXNrdG9wL1NjYW4lMjBHeW0lMjBQcm9qZWN0L3NjYW4tZ3ltL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiBcIjo6XCIsXG4gICAgcG9ydDogODA4MCxcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgbW9kZSA9PT0gXCJkZXZlbG9wbWVudFwiID8gY29tcG9uZW50VGFnZ2VyKCkgOiBudWxsLFxuICBdLmZpbHRlcigocGx1Z2luKTogcGx1Z2luIGlzIE5vbk51bGxhYmxlPHR5cGVvZiBwbHVnaW4+ID0+IHBsdWdpbiAhPT0gbnVsbCksXG4gIHJlc29sdmU6IHtcbiAgICBkZWR1cGU6IFtcInJlYWN0XCIsIFwicmVhY3QtZG9tXCJdLFxuICAgIGFsaWFzOiB7XG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICB9LFxuICB9LFxufSkpOyJdLAogICJtYXBwaW5ncyI6ICI7QUFBc1ksU0FBUyxvQkFBb0I7QUFDbmEsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHVCQUF1QjtBQUhoQyxJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssT0FBTztBQUFBLEVBQ3pDLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixTQUFTLGdCQUFnQixnQkFBZ0IsSUFBSTtBQUFBLEVBQy9DLEVBQUUsT0FBTyxDQUFDLFdBQWlELFdBQVcsSUFBSTtBQUFBLEVBQzFFLFNBQVM7QUFBQSxJQUNQLFFBQVEsQ0FBQyxTQUFTLFdBQVc7QUFBQSxJQUM3QixPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K
