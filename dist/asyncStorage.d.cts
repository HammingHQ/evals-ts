import { AsyncLocalStorage } from 'node:async_hooks';
import { RunContext } from './types.cjs';

declare const asyncRunContext: AsyncLocalStorage<RunContext>;

export { asyncRunContext };
