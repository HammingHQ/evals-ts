var p=Object.defineProperty;var b=(i,e,r)=>e in i?p(i,e,{enumerable:!0,configurable:!0,writable:!0,value:r}):i[e]=r;var c=(i,e,r)=>(b(i,typeof e!="symbol"?e+"":e,r),r);var D=class{constructor(e){c(this,"retries");c(this,"retryDelay");c(this,"retryOn");let s={...{retries:3,retryDelay:1e3,retryOn:[]},...e};this.validateDefaults(s),this.retries=s.retries,this.retryDelay=s.retryDelay,this.retryOn=s.retryOn}validateDefaults(e){if(e.retries!==void 0&&!this.isPositiveInteger(e.retries))throw new o("retries must be a positive integer");if(e.retryDelay!==void 0&&!this.isPositiveInteger(e.retryDelay)&&typeof e.retryDelay!="function")throw new o("retryDelay must be a positive integer or a function returning a positive integer");if(e.retryOn!==void 0&&!Array.isArray(e.retryOn)&&typeof e.retryOn!="function")throw new o("retryOn property expects an array or function")}isPositiveInteger(e){return Number.isInteger(e)&&e>=0}fetchRetry(e,r){let s=this.retries,l=this.retryDelay,y=this.retryOn;return r&&(r.retries!==void 0&&this.isPositiveInteger(r.retries)&&(s=r.retries),r.retryDelay!==void 0&&(this.isPositiveInteger(r.retryDelay)||typeof r.retryDelay=="function")&&(l=r.retryDelay),r.retryOn&&(Array.isArray(r.retryOn)||typeof r.retryOn=="function")&&(y=r.retryOn)),new Promise((R,a)=>{let m=n=>{let h=e instanceof Request?e.clone():e;fetch(h,r).then(t=>{Array.isArray(y)&&!y.includes(t.status)?R(t):typeof y=="function"?Promise.resolve(y(n,null,t)).then(u=>{u?f(n,null,t):R(t)}).catch(a):n<s?f(n,null,t):R(t)}).catch(t=>{typeof y=="function"?Promise.resolve(y(n,t,null)).then(u=>{u?f(n,t,null):a(t)}).catch(a):n<s?f(n,t,null):a(t)})},f=(n,h,t)=>{let u=typeof l=="function"?l(n,h,t,e):l;setTimeout(()=>{m(++n)},u)};m(0)})}},o=class extends Error{constructor(e){super(e),this.name="ArgumentError"}},q=D;export{c as a,q as b};
//# sourceMappingURL=chunk-OXHECJZ4.js.map