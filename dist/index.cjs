"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _chunkYRGJMVAMcjs = require('./chunk-YRGJMVAM.cjs');var _chunk7ARU3YXQcjs = require('./chunk-7ARU3YXQ.cjs');var f=(a=>(a.CREATED="CREATED",a.RUNNING="RUNNING",a.SCORING="SCORING",a.SCORING_FAILED="SCORING_FAILED",a.FINISHED="FINISHED",a.FAILED="FAILED",a))(f||{}),p=class{constructor(t){_chunk7ARU3YXQcjs.a.call(void 0, this,"client");this.client=t}async start(t,e){let s=(await this.client.axios.request({url:`/experiments/${t.id}/items`,method:"POST",data:{datasetItemId:e.id,output:{},metrics:{}}})).data.item,i=Date.now();return{item:s,startTs:i}}async end(t,e){let{item:n,startTs:s}=t,i=Date.now()-s;await this.client.tracing._flush(n.id),await this.client.axios.request({url:`/experiments/${n.experimentId}/items/${n.id}`,method:"PATCH",data:{output:e,metrics:{durationMs:i}}})}},d=class{constructor(t){_chunk7ARU3YXQcjs.a.call(void 0, this,"client");_chunk7ARU3YXQcjs.a.call(void 0, this,"items");this.client=t,this.items=new p(this.client)}async run(t,e){let{dataset:n}=t,s=await this.client.datasets.load(n),{name:i=this.generateName(s.name),scoring:a=T,metadata:y={}}=t,c=await this.start(i,n,a,y),g=`${new URL(this.client.baseURL).origin}/experiments/${c.id}`;try{for(let m of s.items){let v=await this.items.start(c,m),E=await e(m.input);await this.items.end(v,E)}}catch(m){throw await this.end(c,"FAILED"),m}finally{return await this.end(c),console.log("See experiment results at:",g),{experimentUrl:g}}}async start(t,e,n,s){return(await this.client.axios.request({url:"/experiments",method:"POST",data:{name:t,dataset:e,status:"RUNNING",scoring:n,metadata:s}})).data.experiment}async end(t,e="FINISHED"){await this.client.axios.request({url:`/experiments/${t.id}`,method:"PATCH",data:{status:e}})}generateName(t){return`Experiment for ${t} - ${new Date().toLocaleString()}`}},D= exports.ScoreType =(a=>(a.AccuracyAI="accuracy_ai",a.FactsCompare="facts_compare",a.ContextRecall="context_recall",a.ContextPrecision="context_precision",a.Hallucination="hallucination",a.StringDiff="string_diff",a))(D||{}),T= exports.DefaultScoreTypes =["string_diff"],u=class{constructor(t){_chunk7ARU3YXQcjs.a.call(void 0, this,"client");this.client=t}async load(t){return(await this.client.axios.request({url:`/datasets/${t}`,method:"GET"})).data.dataset}async list(){return(await this.client.axios.request({url:"/datasets",method:"GET"})).data.datasets}async create(t){let{name:e,description:n,items:s}=t;return(await this.client.axios.request({url:"/datasets",method:"POST",data:{name:e,description:n,items:s}})).data.dataset}},l=class{constructor(t){_chunk7ARU3YXQcjs.a.call(void 0, this,"client");_chunk7ARU3YXQcjs.a.call(void 0, this,"collected",[]);_chunk7ARU3YXQcjs.a.call(void 0, this,"currentLocalTraceId",0);this.client=t}nextTraceId(){return this.currentLocalTraceId++}async _flush(t){let e=this.collected;this.collected=[];let n={id:this.nextTraceId(),experimentItemId:t,event:{kind:"root"}},s=[n];for(let i of e)s.push({id:this.nextTraceId(),experimentItemId:t,parentId:n.id,event:i});await this.client.axios.request({url:"/traces",method:"POST",data:{traces:s}})}_generationEvent(t){return{kind:"llm",...t}}_retrievalEvent(t){let e=a=>typeof a=="string",n=_optionalChain([t, 'access', _ => _.results, 'optionalAccess', _2 => _2.every, 'call', _3 => _3(e)]),s=a=>typeof a=="string"?{pageContent:a,metadata:{}}:a,i=n?_optionalChain([t, 'access', _4 => _4.results, 'optionalAccess', _5 => _5.map, 'call', _6 => _6(s)]):t.results;return{kind:"vector",...t,results:i}}log(t,e){typeof t=="string"?this.collected.push({[t]:e}):this.collected.push(t)}logGeneration(t){this.log(this._generationEvent(t))}logRetrieval(t){this.log(this._retrievalEvent(t))}},x=["apiKey","baseURL"],h= exports.Hamming =class extends _chunkYRGJMVAMcjs.a{constructor(e){let n=Object.keys(e).filter(s=>!x.includes(s));n.length>0&&console.warn(`WARNING: Unexpected config keys found: ${n.join(", ")}. Valid config keys are: ${x.join(", ")}. The unexpected keys will be ignored.`);super({apiKey:e.apiKey,baseURL:_nullishCoalesce(e.baseURL, () => ("https://app.hamming.ai/api/rest"))});_chunk7ARU3YXQcjs.a.call(void 0, this,"experiments",new d(this));_chunk7ARU3YXQcjs.a.call(void 0, this,"datasets",new u(this));_chunk7ARU3YXQcjs.a.call(void 0, this,"tracing",new l(this))}};exports.DefaultScoreTypes = T; exports.ExperimentStatus = f; exports.Hamming = h; exports.ScoreType = D;
//# sourceMappingURL=index.cjs.map