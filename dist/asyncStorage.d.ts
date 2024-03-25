import { AsyncLocalStorage } from 'node:async_hooks';
import { RunContext } from './types.js';

declare const asyncRunContext: AsyncLocalStorage<RunContext>;

export { asyncRunContext };
