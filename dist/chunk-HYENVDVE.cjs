"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }var _chunkDGYN466Bcjs = require('./chunk-DGYN466B.cjs');var _chunkSV3NKFSMcjs = require('./chunk-SV3NKFSM.cjs');var _chunk7ARU3YXQcjs = require('./chunk-7ARU3YXQ.cjs');var E=10;function S(l){return{tracing:{experiment:{itemId:l}}}}var R=["string_diff"],w=class{constructor(t){_chunk7ARU3YXQcjs.a.call(void 0, this,"client");this.client=t}async start(t,e,n){let r=(await(await this.client.fetch(`/experiments/${t.id}/items`,{method:"POST",body:JSON.stringify({datasetItemId:e.id,output:{},metrics:{},sampleId:n})})).json()).item,o=Date.now();return{item:r,startTs:o}}async end(t,e){let{item:n,startTs:i}=t,a=Date.now()-i;await this.client.tracing._flush(n.id),await this.client.fetch(`/experiments/${n.experimentId}/items/${n.id}`,{method:"PATCH",body:JSON.stringify({output:e,metrics:{durationMs:a}})})}},T= exports.a =class{constructor(t){_chunk7ARU3YXQcjs.a.call(void 0, this,"client");_chunk7ARU3YXQcjs.a.call(void 0, this,"items");this.client=t,this.items=new w(this.client)}async run(t,e){let{dataset:n}=t,i=await this.client.datasets.load(n);this.client.tracing._setMode("experiment");let{name:a=this.generateName(i.name),scoring:r=R,metadata:o={},sampling:x}=t,y=_nullishCoalesce(x, () => (1));if(y>E)throw new Error(`The maximum number of samples is ${E}.`);let m=await this.start(a,n,r,o,x),f=`${new URL(this.client.baseURL).origin}/experiments/${m.id}`;try{for(let s=0;s<y;s++)if(t.parallel){let c=async d=>{let g=await this.items.start(m,d,s),C=await _chunkDGYN466Bcjs.a.run(S(g.item.id),async()=>e(d.input));await this.items.end(g,C)},p=typeof t.parallel=="number"?t.parallel:void 0;await _chunkSV3NKFSMcjs.a.call(void 0, i.items,c,p)}else for(let c of i.items){let p=await this.items.start(m,c,s),d=await _chunkDGYN466Bcjs.a.run(S(p.item.id),async()=>await e(c.input));await this.items.end(p,d)}}catch(s){throw await this.end(m,"FAILED"),s}finally{await this.end(m),console.log("See experiment results at:",f)}return{experimentUrl:f}}async start(t,e,n,i,a){let r="RUNNING";return(await(await this.client.fetch("/experiments",{method:"POST",body:JSON.stringify({name:t,dataset:e,status:r,scoring:n,metadata:i,sampling:a})})).json()).experiment}async end(t,e="FINISHED"){await this.client.fetch(`/experiments/${t.id}`,{method:"PATCH",body:JSON.stringify({status:e})})}generateName(t){return`Experiment for ${t} - ${new Date().toLocaleString()}`}};exports.a = T;
//# sourceMappingURL=chunk-HYENVDVE.cjs.map