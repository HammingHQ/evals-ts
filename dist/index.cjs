"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _chunkR23WTKZGcjs = require('./chunk-R23WTKZG.cjs');var v=(e=>(e.CREATED="CREATED",e.RUNNING="RUNNING",e.SCORING="SCORING",e.SCORING_FAILED="SCORING_FAILED",e.FINISHED="FINISHED",e.FAILED="FAILED",e))(v||{}),m=class{constructor(t){_chunkR23WTKZGcjs.a.call(void 0, this,"client");this.client=t}async start(t,n){let s=(await(await this.client.fetch(`/experiments/${t.id}/items`,{method:"POST",body:JSON.stringify({datasetItemId:n.id,output:{},metrics:{}})})).json()).item,e=Date.now();return{item:s,startTs:e}}async end(t,n){let{item:a,startTs:i}=t,s=Date.now()-i;await this.client.fetch(`/experiments/${a.experimentId}/items/${a.id}`,{method:"PATCH",body:JSON.stringify({output:n,metrics:{durationMs:s}})}),await this.client.tracing._flush(a.id)}},d=class{constructor(t){_chunkR23WTKZGcjs.a.call(void 0, this,"client");_chunkR23WTKZGcjs.a.call(void 0, this,"items");this.client=t,this.items=new m(this.client)}async run(t,n){let{dataset:a}=t,i=await this.client.datasets.load(a),{name:s=this.generateName(i.name),scoring:e=D,metadata:g={}}=t,p=await this.start(s,a,e,g);try{for(let c of i.items){let f=await this.items.start(p,c),x=await n(c.input);await this.items.end(f,x)}}catch(c){throw await this.end(p,"FAILED"),c}finally{await this.end(p)}}async start(t,n,a,i){return(await(await this.client.fetch("/experiments",{method:"POST",body:JSON.stringify({name:t,dataset:n,status:"RUNNING",scoring:a,metadata:i})})).json()).experiment}async end(t,n="FINISHED"){await this.client.fetch(`/experiments/${t.id}`,{method:"PATCH",body:JSON.stringify({status:n})})}generateName(t){return`Experiment for ${t} - ${new Date().toLocaleString()}`}},E= exports.ScoreType =(e=>(e.AccuracyAI="accuracy_ai",e.FactsCompare="facts_compare",e.ContextRecall="context_recall",e.ContextPrecision="context_precision",e.Hallucination="hallucination",e.StringDiff="string_diff",e))(E||{}),D= exports.DefaultScoreTypes =["string_diff"],u=class{constructor(t){_chunkR23WTKZGcjs.a.call(void 0, this,"client");this.client=t}async load(t){return(await(await this.client.fetch(`/datasets/${t}`)).json()).dataset}async list(){return(await(await this.client.fetch("/datasets")).json()).datasets}async create(t){let{name:n,description:a,items:i}=t;return(await(await this.client.fetch("/datasets",{method:"POST",body:JSON.stringify({name:n,description:a,items:i})})).json()).dataset}},l=class{constructor(t){_chunkR23WTKZGcjs.a.call(void 0, this,"client");_chunkR23WTKZGcjs.a.call(void 0, this,"collected",[]);_chunkR23WTKZGcjs.a.call(void 0, this,"currentLocalTraceId",0);this.client=t}nextTraceId(){return this.currentLocalTraceId++}async _flush(t){let n=this.collected;this.collected=[];let a={id:this.nextTraceId(),experimentItemId:t,event:{kind:"root"}},i=[a];for(let s of n)i.push({id:this.nextTraceId(),experimentItemId:t,parentId:a.id,event:s});await this.client.fetch("/traces",{method:"POST",body:JSON.stringify({traces:i})})}_generationEvent(t){return{kind:"llm",...t}}_retrievalEvent(t){let n=e=>typeof e=="string",a=_optionalChain([t, 'access', _ => _.results, 'optionalAccess', _2 => _2.every, 'call', _3 => _3(n)]),i=e=>typeof e=="string"?{pageContent:e,metadata:{}}:e,s=a?_optionalChain([t, 'access', _4 => _4.results, 'optionalAccess', _5 => _5.map, 'call', _6 => _6(i)]):t.results;return{kind:"vector",...t,results:s}}log(t,n){typeof t=="string"?this.collected.push({[t]:n}):this.collected.push(t)}logGeneration(t){this.log(this._generationEvent(t))}logRetrieval(t){this.log(this._retrievalEvent(t))}},y=["apiKey","baseURL"],I= exports.Hamming =class extends _chunkR23WTKZGcjs.b{constructor(n){let a=Object.keys(n).filter(i=>!y.includes(i));a.length>0&&console.warn(`WARNING: Unexpected config keys found: ${a.join(", ")}. Valid config keys are: ${y.join(", ")}. The unexpected keys will be ignored.`);super({apiKey:n.apiKey,baseURL:_nullishCoalesce(n.baseURL, () => ("https://app.hamming.ai/api/rest"))});_chunkR23WTKZGcjs.a.call(void 0, this,"experiments",new d(this));_chunkR23WTKZGcjs.a.call(void 0, this,"datasets",new u(this));_chunkR23WTKZGcjs.a.call(void 0, this,"tracing",new l(this))}};exports.DefaultScoreTypes = D; exports.ExperimentStatus = v; exports.Hamming = I; exports.ScoreType = E;
//# sourceMappingURL=index.cjs.map