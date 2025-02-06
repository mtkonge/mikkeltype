import * as esbuild from "npm:esbuild";
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader";

await esbuild.build({
    plugins: [...denoPlugins()],
    entryPoints: ["./src/main.ts"],
    outfile: "./dist/bundle.js",
    bundle: true,
    format: "esm",
});

esbuild.stop();
