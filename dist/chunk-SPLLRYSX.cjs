"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _chunkE6B7PIIGcjs = require('./chunk-E6B7PIIG.cjs');var f=429,g=500,d= exports.a =class{constructor(e){_chunkE6B7PIIGcjs.a.call(void 0, this,"apiKey");_chunkE6B7PIIGcjs.a.call(void 0, this,"baseURL");_chunkE6B7PIIGcjs.a.call(void 0, this,"fetchClient");_chunkE6B7PIIGcjs.a.call(void 0, this,"debug",!1);_chunkE6B7PIIGcjs.a.call(void 0, this,"retries",3);this.apiKey=e.apiKey,this.baseURL=this.sanitizeBaseUrl(e.baseURL),this.fetchClient=new _chunkE6B7PIIGcjs.b,this.debug=process.env.NODE_ENV==="development"}sanitizeBaseUrl(e){return e.trim().replace(/\/$/,"")}async fetch(e,o){let a=this.baseURL+e,s={...o,headers:{..._optionalChain([o, 'optionalAccess', _ => _.headers]),"Content-Type":_nullishCoalesce(_optionalChain([o, 'optionalAccess', _2 => _2.headers, 'optionalAccess', _3 => _3["Content-Type"]]), () => ("application/json")),authorization:`Bearer ${this.apiKey}`}},p=this.retries,c=this.debug;c&&(console.debug(`Fetching URL: ${a}`),console.debug(`Method: ${s.method||"GET"}`),s.body&&console.debug(`Body: ${s.body}`),console.debug(`Headers: ${JSON.stringify(s.headers,null,2)}`));let u=await this.fetchClient.fetchRetry(a,{...s,retryOn:function(i,h,r){if(i>=p)return!1;let n=_optionalChain([r, 'optionalAccess', _4 => _4.status]);return h instanceof TypeError||n===f||n!==void 0&&n>=g},retryDelay:function(i,h,r,n){return c&&console.debug(`Fetch attempt #${i}: input=${n}, error=${_optionalChain([h, 'optionalAccess', _5 => _5.message])}, response status=${_optionalChain([r, 'optionalAccess', _6 => _6.status])}, response status text=${_optionalChain([r, 'optionalAccess', _7 => _7.statusText])}`),Math.pow(2,i)*1e3}});return c&&console.debug(`Response for ${a}: ${u.status} ${u.statusText}`),u}};exports.a = d;
//# sourceMappingURL=chunk-SPLLRYSX.cjs.map