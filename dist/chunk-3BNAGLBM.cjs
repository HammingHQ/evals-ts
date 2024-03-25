"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _chunkJG6LIMBVcjs = require('./chunk-JG6LIMBV.cjs');var _chunk7ARU3YXQcjs = require('./chunk-7ARU3YXQ.cjs');var f=429,R=500,l= exports.a =class{constructor(e){_chunk7ARU3YXQcjs.a.call(void 0, this,"apiKey");_chunk7ARU3YXQcjs.a.call(void 0, this,"baseURL");_chunk7ARU3YXQcjs.a.call(void 0, this,"fetchClient");_chunk7ARU3YXQcjs.a.call(void 0, this,"debug",!1);_chunk7ARU3YXQcjs.a.call(void 0, this,"retries",3);this.apiKey=e.apiKey,this.baseURL=this.sanitizeBaseUrl(e.baseURL),this.fetchClient=new _chunkJG6LIMBVcjs.a,this.debug=process.env.NODE_ENV==="development"}sanitizeBaseUrl(e){return e.trim().replace(/\/$/,"")}async fetch(e,a){let o=this.baseURL+e,s={...a,headers:{..._optionalChain([a, 'optionalAccess', _ => _.headers]),"Content-Type":_nullishCoalesce(_optionalChain([a, 'optionalAccess', _2 => _2.headers, 'optionalAccess', _3 => _3["Content-Type"]]), () => ("application/json")),authorization:`Bearer ${this.apiKey}`}},h=this.debug;h&&console.debug(`
Fetching URL: ${o}
Method: ${s.method||"GET"}${s.body?`
Body: ${s.body}`:""}
Headers: ${JSON.stringify(s.headers,null,2)}`);let d=this.retries,u=await this.fetchClient.fetchRetry(o,{...s,retryOn:function(r,c,i){if(r>=d)return!1;let n=_optionalChain([i, 'optionalAccess', _4 => _4.status]);return c instanceof TypeError||n===f||n!==void 0&&n>=R},retryDelay:function(r,c,i,n){return console.warn(`Fetch attempt #${r}: input=${n}, error=${_optionalChain([c, 'optionalAccess', _5 => _5.message])}, response status=${_optionalChain([i, 'optionalAccess', _6 => _6.status])}, response status text=${_optionalChain([i, 'optionalAccess', _7 => _7.statusText])}`),Math.pow(2,r)*1e3}});return h&&console.debug(`Response for ${o}: ${u.status} ${u.statusText}
`),u}};exports.a = l;
//# sourceMappingURL=chunk-3BNAGLBM.cjs.map