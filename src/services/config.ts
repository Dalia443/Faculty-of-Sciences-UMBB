/** Single place where environment variables are read. */
export const config = {
  /** Base URL of the backend REST API (VITE_API_URL), without trailing slash. */
  apiUrl: (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, ''),
  /** Demonstration mode is ON unless VITE_USE_DEMO is explicitly "false". */
  useDemo: import.meta.env.VITE_USE_DEMO !== 'false',
} as const;
