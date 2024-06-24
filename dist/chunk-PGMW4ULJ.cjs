"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } async function _asyncNullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return await rhsFn(); } }var _chunkVDVUZYBGcjs = require('./chunk-VDVUZYBG.cjs');var _chunkZQ5ROYXGcjs = require('./chunk-ZQ5ROYXG.cjs');var _chunkSV3NKFSMcjs = require('./chunk-SV3NKFSM.cjs');var _chunk7ARU3YXQcjs = require('./chunk-7ARU3YXQ.cjs');var R=10;function F(g){return{tracing:{experiment:{itemId:g}}}}var N=["string_diff"],f=class{constructor(t){_chunk7ARU3YXQcjs.a.call(void 0, this,"client");this.client=t}async start(t,e,r){let n=(await(await this.client.fetch(`/experiments/${t.id}/items`,{method:"POST",body:JSON.stringify({datasetItemId:e.id,output:{},metrics:{},sampleId:r})})).json()).item,c=Date.now();return{item:n,startTs:c}}async end(t,e,r={}){let{item:i,startTs:s}=t,n=Date.now()-s;await this.client.tracing._flush(i.id),await this.client.fetch(`/experiments/${i.experimentId}/items/${i.id}`,{method:"PATCH",body:JSON.stringify({output:e,scores:r,metrics:{durationMs:n}})})}},v= exports.a =class{constructor(t){_chunk7ARU3YXQcjs.a.call(void 0, this,"client");_chunk7ARU3YXQcjs.a.call(void 0, this,"items");this.client=t,this.items=new f(this.client)}async run(t,e){let{dataset:r}=t,i=await this.client.datasets.load(r);this.client.tracing._setMode("experiment");let{name:s=this.generateName(i.name),scoring:n=N,metadata:c={},sampling:m}=t,x=_nullishCoalesce(m, () => (1));if(x>R)throw new Error(`The maximum number of samples is ${R}.`);let d=new w(this.client,n);await d.initialize();let u=await this.start(s,r,d.getConfig(),c,m),C=`${new URL(this.client.baseURL).origin}/experiments/${u.id}`;try{for(let p=0;p<x;p++)if(t.parallel){let l=async a=>{let y=await this.items.start(u,a,p),T=await _chunkVDVUZYBGcjs.a.run(F(y.item.id),async()=>e(a.input)),O=await d.score(a.input,a.output,T);await this.items.end(y,T,O)},h=typeof t.parallel=="number"?t.parallel:void 0;await _chunkSV3NKFSMcjs.a.call(void 0, i.items,l,h)}else for(let l of i.items){let h=await this.items.start(u,l,p),a=await _chunkVDVUZYBGcjs.a.run(F(h.item.id),async()=>await e(l.input)),y=await d.score(l.input,l.output,a);await this.items.end(h,a,y)}}catch(p){throw await this.end(u,"FAILED"),p}finally{await this.end(u),console.log("See experiment results at:",C)}return{experimentUrl:C}}async start(t,e,r,i,s){let n="RUNNING";return(await(await this.client.fetch("/experiments",{method:"POST",body:JSON.stringify({name:t,dataset:e,status:n,scoring:r,metadata:i,sampling:s})})).json()).experiment}async end(t,e="FINISHED"){await this.client.fetch(`/experiments/${t.id}`,{method:"PATCH",body:JSON.stringify({status:e})})}generateName(t){return`Experiment for ${t} - ${new Date().toLocaleString()}`}},w=class{constructor(t,e){_chunk7ARU3YXQcjs.a.call(void 0, this,"client");_chunk7ARU3YXQcjs.a.call(void 0, this,"standardScoring");_chunk7ARU3YXQcjs.a.call(void 0, this,"customScoring");_chunk7ARU3YXQcjs.a.call(void 0, this,"registeredFunctions",[]);_chunk7ARU3YXQcjs.a.call(void 0, this,"initialized",!1);this.client=t,this.standardScoring=e.filter(r=>typeof r=="string"),this.customScoring=e.filter(r=>typeof r!="string")}async initialize(){await this.registerScoringFunctions(),this.initialized=!0}getConfig(){if(!this.initialized)throw new Error("ScoringHelper is not initialized");return[...this.standardScoring,...this.registeredFunctions.map(t=>t.registration)]}async score(t,e,r){if(!this.initialized)throw new Error("ScoringHelper is not initialized");let i={},s=this.registeredFunctions.filter(n=>n.scorer.type==="local").map(async n=>{let c=n.scorer;try{i[n.registration.key_name]=await c.scoreFn({input:t,output:r,expected:e})}catch(m){console.error(`Failed to locally run score ${n.name.toLowerCase()}.`,"Note: This error will be displayed in the dashboard. All other scoring will be preserved and displayed accordingly.","Error received:",m),i[n.registration.key_name]={value:-1,reason:`${_chunkZQ5ROYXGcjs.j}${m.message}`}}});return await Promise.allSettled(s),i}async registerScoringFunctions(){let t=this.customScoring.map(s=>({name:s.name,version:s.version,score_config:s.scoreConfig,execution_config:{}})),i=await _asyncNullishCoalesce((await(await this.client.fetch("/scoring/register-functions",{method:"POST",body:JSON.stringify({scoring:t})})).json()).scoring, async () => ([]));this.registeredFunctions=this.customScoring.map((s,n)=>({...s,registration:i[n]}))}};exports.a = v;
//# sourceMappingURL=chunk-PGMW4ULJ.cjs.map