import { defineConfig } from "tsup";

export default defineConfig({
  entryPoints: ["./src/index.ts"],
  format: ["esm"],
  dts: true,
  platform: "node",
  skipNodeModulesBundle: true,
});
