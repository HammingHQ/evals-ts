import{a as r,b as h}from"./chunk-YTIYBO3Q.js";var v=(a=>(a.CREATED="CREATED",a.RUNNING="RUNNING",a.SCORING="SCORING",a.SCORING_FAILED="SCORING_FAILED",a.FINISHED="FINISHED",a.FAILED="FAILED",a))(v||{}),d=class{constructor(t){r(this,"client");this.client=t}async start(t,e){let s=(await(await this.client.fetch(`/experiments/${t.id}/items`,{method:"POST",body:JSON.stringify({datasetItemId:e.id,output:{},metrics:{}})})).json()).item,a=Date.now();return{item:s,startTs:a}}async end(t,e){let{item:n,startTs:i}=t,s=Date.now()-i;await this.client.fetch(`/experiments/${n.experimentId}/items/${n.id}`,{method:"PATCH",body:JSON.stringify({output:e,metrics:{durationMs:s}})}),await this.client.tracing._flush(n.id)}},u=class{constructor(t){r(this,"client");r(this,"items");this.client=t,this.items=new d(this.client)}async run(t,e){let{dataset:n}=t,i=await this.client.datasets.load(n),{name:s=this.generateName(i.name),scoring:a=D,metadata:o={}}=t,p=await this.start(s,n,a,o);try{for(let m of i.items){let f=await this.items.start(p,m),x=await e(m.input);await this.items.end(f,x)}}catch(m){throw await this.end(p,"FAILED"),m}finally{await this.end(p)}}async start(t,e,n,i){return(await(await this.client.fetch("/experiments",{method:"POST",body:JSON.stringify({name:t,dataset:e,status:"RUNNING",scoring:n,metadata:i})})).json()).experiment}async end(t,e="FINISHED"){await this.client.fetch(`/experiments/${t.id}`,{method:"PATCH",body:JSON.stringify({status:e})})}generateName(t){return`Experiment for ${t} - ${new Date().toLocaleString()}`}},E=(o=>(o.AccuracyAI="accuracy_ai",o.AccuracyHuman="accuracy_human",o.FactsCompare="facts_compare",o.ContextRecall="context_recall",o.ContextPrecision="context_precision",o.Hallucination="hallucination",o.StringDiff="string_diff",o))(E||{}),D=["string_diff"],l=class{constructor(t){r(this,"client");this.client=t}async load(t){return(await(await this.client.fetch(`/datasets/${t}`)).json()).dataset}async list(){return(await(await this.client.fetch("/datasets")).json()).datasets}async create(t){let{name:e,description:n,items:i}=t;return(await(await this.client.fetch("/datasets",{method:"POST",body:JSON.stringify({name:e,description:n,items:i})})).json()).dataset}},g=class{constructor(t){r(this,"client");r(this,"collected",[]);r(this,"currentLocalTraceId",0);this.client=t}nextTraceId(){return this.currentLocalTraceId++}async _flush(t){let e=this.collected;this.collected=[];let n={id:this.nextTraceId(),experimentItemId:t,event:{kind:"root"}},i=[n];for(let s of e)i.push({id:this.nextTraceId(),experimentItemId:t,parentId:n.id,event:s});await this.client.fetch("/traces",{method:"POST",body:JSON.stringify({traces:i})})}_generationEvent(t){return{kind:"llm",...t}}_retrievalEvent(t){let e=a=>typeof a=="string",n=t.results?.every(e),i=a=>typeof a=="string"?{pageContent:a,metadata:{}}:a,s=n?t.results?.map(i):t.results;return{kind:"vector",...t,results:s}}log(t,e){typeof t=="string"?this.collected.push({[t]:e}):this.collected.push(t)}logGeneration(t){this.log(this._generationEvent(t))}logRetrieval(t){this.log(this._retrievalEvent(t))}},y=["apiKey","baseURL"],I=class extends h{constructor(e){let n=Object.keys(e).filter(i=>!y.includes(i));n.length>0&&console.warn(`WARNING: Unexpected config keys found: ${n.join(", ")}. Valid config keys are: ${y.join(", ")}. The unexpected keys will be ignored.`);super({apiKey:e.apiKey,baseURL:e.baseURL??"https://app.hamming.ai/api/rest"});r(this,"experiments",new u(this));r(this,"datasets",new l(this));r(this,"tracing",new g(this))}};export{D as DefaultScoreTypes,v as ExperimentStatus,I as Hamming,E as ScoreType};
//# sourceMappingURL=index.js.map