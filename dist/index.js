import{a as r,b as I}from"./chunk-K2DRTD63.js";var D=(e=>(e.CREATED="CREATED",e.RUNNING="RUNNING",e.SCORING="SCORING",e.SCORING_FAILED="SCORING_FAILED",e.FINISHED="FINISHED",e.FAILED="FAILED",e))(D||{}),m=class{constructor(t){r(this,"client");this.client=t}async start(t,n){let s=(await(await this.client.fetch(`/experiments/${t.id}/items`,{method:"POST",body:JSON.stringify({datasetItemId:n.id,output:{},metrics:{}})})).json()).item,e=Date.now();return{item:s,startTs:e}}async end(t,n){let{item:a,startTs:i}=t,s=Date.now()-i;await this.client.tracing._flush(a.id),await this.client.fetch(`/experiments/${a.experimentId}/items/${a.id}`,{method:"PATCH",body:JSON.stringify({output:n,metrics:{durationMs:s}})})}},d=class{constructor(t){r(this,"client");r(this,"items");this.client=t,this.items=new m(this.client)}async run(t,n){let{dataset:a}=t,i=await this.client.datasets.load(a),{name:s=this.generateName(i.name),scoring:e=w,metadata:g={}}=t,c=await this.start(s,a,e,g),h=`${new URL(this.client.baseURL).origin}/experiments/${c.id}`;try{for(let p of i.items){let x=await this.items.start(c,p),v=await n(p.input);await this.items.end(x,v)}}catch(p){throw await this.end(c,"FAILED"),p}finally{return await this.end(c),console.log("See experiment results at:",h),{experimentUrl:h}}}async start(t,n,a,i){return(await(await this.client.fetch("/experiments",{method:"POST",body:JSON.stringify({name:t,dataset:n,status:"RUNNING",scoring:a,metadata:i})})).json()).experiment}async end(t,n="FINISHED"){await this.client.fetch(`/experiments/${t.id}`,{method:"PATCH",body:JSON.stringify({status:n})})}generateName(t){return`Experiment for ${t} - ${new Date().toLocaleString()}`}},E=(e=>(e.AccuracyAI="accuracy_ai",e.FactsCompare="facts_compare",e.ContextRecall="context_recall",e.ContextPrecision="context_precision",e.Hallucination="hallucination",e.StringDiff="string_diff",e))(E||{}),w=["string_diff"],l=class{constructor(t){r(this,"client");this.client=t}async load(t){return(await(await this.client.fetch(`/datasets/${t}`)).json()).dataset}async list(){return(await(await this.client.fetch("/datasets")).json()).datasets}async create(t){let{name:n,description:a,items:i}=t;return(await(await this.client.fetch("/datasets",{method:"POST",body:JSON.stringify({name:n,description:a,items:i})})).json()).dataset}},u=class{constructor(t){r(this,"client");r(this,"collected",[]);r(this,"currentLocalTraceId",0);this.client=t}nextTraceId(){return this.currentLocalTraceId++}async _flush(t){let n=this.collected;this.collected=[];let a={id:this.nextTraceId(),experimentItemId:t,event:{kind:"root"}},i=[a];for(let s of n)i.push({id:this.nextTraceId(),experimentItemId:t,parentId:a.id,event:s});await this.client.fetch("/traces",{method:"POST",body:JSON.stringify({traces:i})})}_generationEvent(t){return{kind:"llm",...t}}_retrievalEvent(t){let n=e=>typeof e=="string",a=t.results?.every(n),i=e=>typeof e=="string"?{pageContent:e,metadata:{}}:e,s=a?t.results?.map(i):t.results;return{kind:"vector",...t,results:s}}log(t,n){typeof t=="string"?this.collected.push({[t]:n}):this.collected.push(t)}logGeneration(t){this.log(this._generationEvent(t))}logRetrieval(t){this.log(this._retrievalEvent(t))}},y=["apiKey","baseURL"],f=class extends I{constructor(n){let a=Object.keys(n).filter(i=>!y.includes(i));a.length>0&&console.warn(`WARNING: Unexpected config keys found: ${a.join(", ")}. Valid config keys are: ${y.join(", ")}. The unexpected keys will be ignored.`);super({apiKey:n.apiKey,baseURL:n.baseURL??"https://app.hamming.ai/api/rest"});r(this,"experiments",new d(this));r(this,"datasets",new l(this));r(this,"tracing",new u(this))}};export{w as DefaultScoreTypes,D as ExperimentStatus,f as Hamming,E as ScoreType};
//# sourceMappingURL=index.js.map