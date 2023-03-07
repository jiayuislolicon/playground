import { defineConfig } from "vite";
import glslify from "rollup-plugin-glslify";
import * as path from "path";

export default defineConfig({
    build: {
        outDir: "../dist",
    },
    resolve: {
        alias: {
            src: path.resolve(__dirname, "./src"),
        },
    },
    plugins: [glslify()],
});
