"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _chunkJG6LIMBVcjs = require('./chunk-JG6LIMBV.cjs');var _chunk7ARU3YXQcjs = require('./chunk-7ARU3YXQ.cjs');var f=429,R=500,y=401,l= exports.a =class{constructor(e){_chunk7ARU3YXQcjs.a.call(void 0, this,"apiKey");_chunk7ARU3YXQcjs.a.call(void 0, this,"baseURL");_chunk7ARU3YXQcjs.a.call(void 0, this,"fetchClient");_chunk7ARU3YXQcjs.a.call(void 0, this,"debug",!1);_chunk7ARU3YXQcjs.a.call(void 0, this,"retries",3);this.apiKey=e.apiKey,this.baseURL=this.sanitizeBaseUrl(e.baseURL),this.fetchClient=new _chunkJG6LIMBVcjs.a,this.debug=process.env.NODE_ENV==="development"}sanitizeBaseUrl(e){return e.trim().replace(/\/$/,"")}async fetch(e,o){let c=this.baseURL+e,s={...o,headers:{..._optionalChain([o, 'optionalAccess', _ => _.headers]),"Content-Type":_nullishCoalesce(_optionalChain([o, 'optionalAccess', _2 => _2.headers, 'optionalAccess', _3 => _3["Content-Type"]]), () => ("application/json")),authorization:`Bearer ${this.apiKey}`}},h=this.debug;h&&console.debug(`
Fetching URL: ${c}
Method: ${s.method||"GET"}${s.body?`
Body: ${s.body}`:""}
Headers: ${JSON.stringify(s.headers,null,2)}`);let d=this.retries,r=await this.fetchClient.fetchRetry(c,{...s,retryOn:function(i,u,a){if(i>=d)return!1;let n=_optionalChain([a, 'optionalAccess', _4 => _4.status]);return u instanceof TypeError||n===f||n!==void 0&&n>=R},retryDelay:function(i,u,a,n){return console.warn(`Fetch attempt #${i}: input=${n}, error=${_optionalChain([u, 'optionalAccess', _5 => _5.message])}, response status=${_optionalChain([a, 'optionalAccess', _6 => _6.status])}, response status text=${_optionalChain([a, 'optionalAccess', _7 => _7.statusText])}`),Math.pow(2,i)*1e3}});if(r.status===y)throw new Error(`Unauthorized. Please check that your HAMMING_API_KEY is correct by visiting: ${this.baseURL}/settings`);return h&&console.debug(`Response for ${c}: ${r.status} ${r.statusText}
`),r}};exports.a = l;
//# sourceMappingURL=chunk-WJTAB5JV.cjs.map