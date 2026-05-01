# JavaScript Features and Environment Constraints in Google Apps Script

Google Apps Script is built on the V8 runtime, which provides support for modern ECMAScript (ES6+) features. However, because it executes within a sandboxed server-side environment, several common JavaScript patterns are unsupported.

## Unsupported Module and Environment Features

*   **ES6 Modules (`import` / `export`):** Apps Script does not support standard ECMAScript module syntax. All scripts in a project share a single global namespace.
*   **CommonJS (`require` / `module.exports`):** Node.js-style module loading is not supported as there is no local file system or `require` resolver.
*   **Browser Globals:** Because the code executes on Google servers, browser-specific APIs are unavailable:
    *   `window`
    *   `document`
    *   DOM manipulation (e.g., `querySelector`)
    *   `localStorage` or `sessionStorage`
*   **Node.js Core Modules:** Server-side Node.js built-in modules are not available:
    *   `fs` (File System)
    *   `path`
    *   `process`
    *   `Buffer`
*   **Web API Limitations:** Standard browser APIs for network requests (like `fetch` or `XMLHttpRequest`) are not available; developers must use the `UrlFetchApp` service instead.

## Runtime Notes

*   **Global Scope:** Functions and variables defined at the top level of any file in the project are globally accessible to all other files in that same project.
*   **Transpilation:** To use features like `import`/`export` in a local development environment (via `clasp`), you must use a local transpiler or bundler (e.g., Babel, Webpack, or Esbuild) to convert your code into a format compatible with the Apps Script runtime before pushing.

*Source: [Google Apps Script: V8 Runtime Overview](https://developers.google.com/apps-script/guides/v8-runtime)*
