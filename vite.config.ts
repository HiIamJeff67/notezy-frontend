import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const rawBasePath = env.VITE_APP_BASE_PATH || "/development/v1";
  const normalizedBasePath = `/${rawBasePath.replace(/^\/+|\/+$/g, "")}/`;

  return {
    base: normalizedBasePath,
    server: {
      port: Number(env.VITE_PORT || 6776),
    },
    resolve: {
      tsconfigPaths: true,
    },
    plugins: [
      tailwindcss(),
      tanstackStart({
        srcDirectory: "src",
        router: {
          routesDirectory: "routes",
        },
      }),
      viteReact(),
      nitro(),
    ],
  };
});
