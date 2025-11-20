# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Data caching

- `src/utils/installFetchCache.js` installs a transparent in-memory cache for every `fetch` GET call (default TTL: 2 minutes). Override per call with `cacheTtl`, custom cache keys, or skip it entirely with `skipCache: true`/`headers['x-disable-cache']`.
- `src/config/axios.config.js` applies the same TTL cache to every `axiosInstance` GET. Pass `cacheTtl` for per-request overrides or `skipCache: true` to bypass.
- Successful non-GET requests automatically bust cache entries that include the mutated path. Manual invalidation is possible via `invalidateCache` from `src/utils/requestCache.js`.
- When building new data hooks, just keep using `fetch`/`axiosInstance`—no extra wiring is required, but you can fine-tune cache behaviour with the knobs above.

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
