import { AsyncLocalStorage } from "node:async_hooks";

import { RunContext } from "./types";

export const asyncRunContext = new AsyncLocalStorage<RunContext>();
