import { config } from './config';
import { demoApi } from './demo/demoApi';
import { httpApi } from './httpApi';
import type { ApiClient } from './types';

/**
 * The only API entry point used by the UI.
 * Switch between demo data and the real backend with VITE_USE_DEMO.
 */
export const api: ApiClient = config.useDemo ? demoApi : httpApi;
export { ApiError } from './types';
export type { ApiClient } from './types';
