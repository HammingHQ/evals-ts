import{a as I}from"./chunk-MWJKW3OQ.js";import{a as r}from"./chunk-OXHECJZ4.js";var D=(n=>(n.CREATED="CREATED",n.RUNNING="RUNNING",n.SCORING="SCORING",n.SCORING_FAILED="SCORING_FAILED",n.FINISHED="FINISHED",n.FAILED="FAILED",n))(D||{}),m=class{constructor(t){r(this,"client");this.client=t}async start(t,e){let i=(await(await this.client.fetch(`/experiments/${t.id}/items`,{method:"POST",body:JSON.stringify({datasetItemId:e.id,output:{},metrics:{}})})).json()).item,n=Date.now();return{item:i,startTs:n}}async end(t,e){let{item:a,startTs:s}=t,i=Date.now()-s;await this.client.tracing._flush(a.id),await this.client.fetch(`/experiments/${a.experimentId}/items/${a.id}`,{method:"PATCH",body:JSON.stringify({output:e,metrics:{durationMs:i}})})}},d=class{constructor(t){r(this,"client");r(this,"items");this.client=t,this.items=new m(this.client)}async run(t,e){let{dataset:a}=t,s=await this.client.datasets.load(a),{name:i=this.generateName(s.name),scoring:n=w,metadata:g={}}=t,c=await this.start(i,a,n,g),h=`${new URL(this.client.baseURL).origin}/experiments/${c.id}`;try{for(let p of s.items){let x=await this.items.start(c,p),v=await e(p.input);await this.items.end(x,v)}}catch(p){throw await this.end(c,"FAILED"),p}finally{return await this.end(c),console.log("See experiment results at:",h),{experimentUrl:h}}}async start(t,e,a,s){return(await(await this.client.fetch("/experiments",{method:"POST",body:JSON.stringify({name:t,dataset:e,status:"RUNNING",scoring:a,metadata:s})})).json()).experiment}async end(t,e="FINISHED"){await this.client.fetch(`/experiments/${t.id}`,{method:"PATCH",body:JSON.stringify({status:e})})}generateName(t){return`Experiment for ${t} - ${new Date().toLocaleString()}`}},E=(n=>(n.AccuracyAI="accuracy_ai",n.FactsCompare="facts_compare",n.ContextRecall="context_recall",n.ContextPrecision="context_precision",n.Hallucination="hallucination",n.StringDiff="string_diff",n))(E||{}),w=["string_diff"],l=class{constructor(t){r(this,"client");this.client=t}async load(t){let e=await this.client.fetch(`/datasets/${t}`,{method:"GET"}),a;try{a=await e.json()}catch(s){throw new Error(`Failed to parse dataset response as JSON for dataset ID: ${t}: ${s}`)}return a.dataset}async list(){return(await(await this.client.fetch("/datasets")).json()).datasets}async create(t){let{name:e,description:a,items:s}=t;return(await(await this.client.fetch("/datasets",{method:"POST",body:JSON.stringify({name:e,description:a,items:s})})).json()).dataset}},u=class{constructor(t){r(this,"client");r(this,"collected",[]);r(this,"currentLocalTraceId",0);this.client=t}nextTraceId(){return this.currentLocalTraceId++}async _flush(t){let e=this.collected;this.collected=[];let a={id:this.nextTraceId(),experimentItemId:t,event:{kind:"root"}},s=[a];for(let i of e)s.push({id:this.nextTraceId(),experimentItemId:t,parentId:a.id,event:i});await this.client.fetch("/traces",{method:"POST",body:JSON.stringify({traces:s})})}_generationEvent(t){return{kind:"llm",...t}}_retrievalEvent(t){let e=n=>typeof n=="string",a=t.results?.every(e),s=n=>typeof n=="string"?{pageContent:n,metadata:{}}:n,i=a?t.results?.map(s):t.results;return{kind:"vector",...t,results:i}}log(t,e){typeof t=="string"?this.collected.push({[t]:e}):this.collected.push(t)}logGeneration(t){this.log(this._generationEvent(t))}logRetrieval(t){this.log(this._retrievalEvent(t))}},y=["apiKey","baseURL"],f=class extends I{constructor(e){let a=Object.keys(e).filter(s=>!y.includes(s));a.length>0&&console.warn(`WARNING: Unexpected config keys found: ${a.join(", ")}. Valid config keys are: ${y.join(", ")}. The unexpected keys will be ignored.`);super({apiKey:e.apiKey,baseURL:e.baseURL??"https://app.hamming.ai/api/rest"});r(this,"experiments",new d(this));r(this,"datasets",new l(this));r(this,"tracing",new u(this))}};export{w as DefaultScoreTypes,D as ExperimentStatus,f as Hamming,E as ScoreType};
//# sourceMappingURL=index.js.map