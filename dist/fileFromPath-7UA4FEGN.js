import{c as h,d as j}from"./chunk-KOKQ5MZ3.js";import{a as M,b as g,d as P}from"./chunk-LURIOADG.js";var m=g((v,d)=>{if(!globalThis.DOMException)try{let{MessageChannel:e}=M("worker_threads"),t=new e().port1,r=new ArrayBuffer;t.postMessage(r,[r,r])}catch(e){e.constructor.name==="DOMException"&&(globalThis.DOMException=e.constructor)}d.exports=globalThis.DOMException});var b=P(m(),1);import{statSync as S,createReadStream as T,promises as w}from"fs";import{basename as _}from"path";var E=e=>Object.prototype.toString.call(e).slice(8,-1).toLowerCase();function F(e){if(E(e)!=="object")return!1;let t=Object.getPrototypeOf(e);return t==null?!0:(t.constructor&&t.constructor.toString())===Object.toString()}var p=F;var u=function(e,t,r,o,i){if(o==="m")throw new TypeError("Private method is not writable");if(o==="a"&&!i)throw new TypeError("Private accessor was defined without a setter");if(typeof t=="function"?e!==t||!i:!t.has(e))throw new TypeError("Cannot write private member to an object whose class did not declare it");return o==="a"?i.call(e,r):i?i.value=r:t.set(e,r),r},a=function(e,t,r,o){if(r==="a"&&!o)throw new TypeError("Private accessor was defined without a getter");if(typeof t=="function"?e!==t||!o:!t.has(e))throw new TypeError("Cannot read private member from an object whose class did not declare it");return r==="m"?o:r==="a"?o.call(e):o?o.value:t.get(e)},s,c,x="The requested file could not be read, typically due to permission problems that have occurred after a reference to a file was acquired.",f=class e{constructor(t){s.set(this,void 0),c.set(this,void 0),u(this,s,t.path,"f"),u(this,c,t.start||0,"f"),this.name=_(a(this,s,"f")),this.size=t.size,this.lastModified=t.lastModified}slice(t,r){return new e({path:a(this,s,"f"),lastModified:this.lastModified,size:r-t,start:t})}async*stream(){let{mtimeMs:t}=await w.stat(a(this,s,"f"));if(t>this.lastModified)throw new b.default(x,"NotReadableError");this.size&&(yield*T(a(this,s,"f"),{start:a(this,c,"f"),end:a(this,c,"f")+this.size-1}))}get[(s=new WeakMap,c=new WeakMap,Symbol.toStringTag)](){return"File"}};function y(e,{mtimeMs:t,size:r},o,i={}){let n;p(o)?[i,n]=[o,void 0]:n=o;let l=new f({path:e,size:r,lastModified:t});return n||(n=l.name),new h([l],n,{...i,lastModified:l.lastModified})}function G(e,t,r={}){let o=S(e);return y(e,o,t,r)}async function A(e,t,r){let o=await w.stat(e);return y(e,o,t,r)}export{A as fileFromPath,G as fileFromPathSync,j as isFile};
/*! Bundled license information:

node-domexception/index.js:
  (*! node-domexception. MIT License. Jimmy Wärting <https://jimmy.warting.se/opensource> *)
*/
//# sourceMappingURL=fileFromPath-7UA4FEGN.js.map