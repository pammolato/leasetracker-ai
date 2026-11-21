import { registerHooks } from "node:module";

const appRoot = new URL("../", import.meta.url);

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      return nextResolve(new URL(`${specifier.slice(2)}.ts`, appRoot).href, context);
    }

    return nextResolve(specifier, context);
  },
});
