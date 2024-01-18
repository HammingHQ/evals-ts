"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var l=Object.defineProperty;var h=(i,e,t)=>e in i?l(i,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):i[e]=t;var c=(i,e,t)=>(h(i,typeof e!="symbol"?e+"":e,t),t);var u=class{constructor(e){c(this,"apiKey");c(this,"baseURL");this.apiKey=e.apiKey,this.baseURL=this.sanitizeBaseUrl(e.baseURL)}sanitizeBaseUrl(e){return e.trim().replace(/\/$/,"")}async fetch(e,t,s=3,n=1e3){let r=this.baseURL+e,o=null;for(let R=0;R<s;R++)try{let a=await this.attemptFetch(r,t);if(a.ok)return a;let E=this.generateErrorMessage(a,r);if(o=new Error(E),this.nonTransientError(a))break;if(this.shouldRetry(a))await this.handleRetry(a,n);else throw new Error(E)}catch(a){if(o=a,!this.isNetworkError(a))break;await this.delay(n)}throw o}nonTransientError(e){return[401,403,404].includes(e.status)}delay(e){return new Promise(t=>setTimeout(t,e))}shouldRetry(e){return e.status===429||e.status>=500}isNetworkError(e){return e instanceof TypeError}generateErrorMessage(e,t){let s=e.status,n=e.statusText,r=`Request failed with status ${s} ${n} while accessing ${t}.`;return s===401?r=`UNAUTHORIZED: Invalid API key ending in '${this.apiKey.slice(-4)}'. Visit https://app.hamming.ai/settings to see valid API keys.`:s===403?r=`FORBIDDEN: You do not have permission to access ${t}.`:s===404?r=`NOT FOUND: The requested resource at ${t} could not be found.`:s===429?r="TOO MANY REQUESTS: You are being rate limited. Please wait before making additional requests. If the issue persists, feel free to email us at founders@hamming.ai for help.":s>=500&&(r=`SERVER ERROR: There was a problem with the server while accessing ${t}. If the issue persists, feel free to email us at founders@hamming.ai for help.`),r}async attemptFetch(e,t){let s=this.createHeaders(_optionalChain([t, 'optionalAccess', _ => _.headers]));return await fetch(e,{...t,headers:s})}createHeaders(e){let t={...e,authorization:`Bearer ${this.apiKey}`};return(!e||!("content-type"in e))&&(t["content-type"]="application/json"),t}async handleRetry(e,t){let s=e.headers.get("Retry-After"),n=s?this.calculateRetryDelayForHeaders(s,t):t;await this.delay(n)}calculateRetryDelayForHeaders(e,t){if(parseInt(e,10))return parseInt(e,10)*1e3;let s=new Date(e);return isNaN(s.getTime())?t:s.getTime()-Date.now()}};exports.a = c; exports.b = u;
//# sourceMappingURL=chunk-TOGIBRKC.cjs.map