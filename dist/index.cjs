var Tt=Object.create;var R=Object.defineProperty;var Et=Object.getOwnPropertyDescriptor;var St=Object.getOwnPropertyNames;var Rt=Object.getPrototypeOf,Pt=Object.prototype.hasOwnProperty;var Mt=(s,t)=>{for(var e in t)R(s,e,{get:t[e],enumerable:!0})},rt=(s,t,e,r)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of St(t))!Pt.call(s,n)&&n!==e&&R(s,n,{get:()=>t[n],enumerable:!(r=Et(t,n))||r.enumerable});return s};var q=(s,t,e)=>(e=s!=null?Tt(Rt(s)):{},rt(t||!s||!s.__esModule?R(e,"default",{value:s,enumerable:!0}):e,s)),Ot=s=>rt(R({},"__esModule",{value:!0}),s);var Kt={};Mt(Kt,{CallProvider:()=>z,EventKind:()=>b,ExperimentStatus:()=>K,FunctionType:()=>ct,Hamming:()=>tt,LabelColor:()=>lt,LogMessageType:()=>j,MonitoringItemStatus:()=>W,MonitoringItemType:()=>U,PromptTemplate:()=>d,RetellCallEventType:()=>B,ScoreParserType:()=>pt,ScoreType:()=>G,ScorerExecutionType:()=>V,ScoringErrorPrefix:()=>J,ScoringErrorValue:()=>mt,SessionEnvironment:()=>at,TracingMode:()=>E});module.exports=Ot(Kt);var $=class{retries;retryDelay;retryOn;constructor(t){let r={...{retries:3,retryDelay:1e3,retryOn:[]},...t};this.validateDefaults(r),this.retries=r.retries,this.retryDelay=r.retryDelay,this.retryOn=r.retryOn}validateDefaults(t){if(t.retries!==void 0&&!this.isPositiveInteger(t.retries))throw new T("retries must be a positive integer");if(t.retryDelay!==void 0&&!this.isPositiveInteger(t.retryDelay)&&typeof t.retryDelay!="function")throw new T("retryDelay must be a positive integer or a function returning a positive integer");if(t.retryOn!==void 0&&!Array.isArray(t.retryOn)&&typeof t.retryOn!="function")throw new T("retryOn property expects an array or function")}isPositiveInteger(t){return Number.isInteger(t)&&t>=0}fetchRetry(t,e){let r=this.retries,n=this.retryDelay,i=this.retryOn;return e&&(e.retries!==void 0&&this.isPositiveInteger(e.retries)&&(r=e.retries),e.retryDelay!==void 0&&(this.isPositiveInteger(e.retryDelay)||typeof e.retryDelay=="function")&&(n=e.retryDelay),e.retryOn&&(Array.isArray(e.retryOn)||typeof e.retryOn=="function")&&(i=e.retryOn)),new Promise((o,p)=>{let a=m=>{let c=t instanceof Request?t.clone():t;fetch(c,e).then(l=>{Array.isArray(i)&&!i.includes(l.status)?o(l):typeof i=="function"?Promise.resolve(i(m,null,l)).then(h=>{h?u(m,null,l):o(l)}).catch(p):m<r?u(m,null,l):o(l)}).catch(l=>{typeof i=="function"?Promise.resolve(i(m,l,null)).then(h=>{h?u(m,l,null):p(l)}).catch(p):m<r?u(m,l,null):p(l)})},u=(m,c,l)=>{let h=typeof n=="function"?n(m,c,l,t):n;setTimeout(()=>{a(++m)},h)};a(0)})}},T=class extends Error{constructor(t){super(t),this.name="ArgumentError"}},nt=$;var _t=429,bt=500,Dt=401,P=class{apiKey;baseURL;fetchClient;debug=!1;retries=3;constructor(t){this.apiKey=t.apiKey,this.baseURL=this.sanitizeBaseUrl(t.baseURL),this.fetchClient=new nt,this.debug=process.env.NODE_ENV==="development"}sanitizeBaseUrl(t){return t.trim().replace(/\/$/,"")}async fetch(t,e){var a;let r=this.baseURL+t,n={...e,headers:{...e==null?void 0:e.headers,"Content-Type":((a=e==null?void 0:e.headers)==null?void 0:a["Content-Type"])??"application/json",authorization:`Bearer ${this.apiKey}`}},i=this.debug;i&&console.debug(`
Fetching URL: ${r}
Method: ${n.method||"GET"}${n.body?`
Body: ${n.body}`:""}
Headers: ${JSON.stringify(n.headers,null,2)}`);let o=this.retries,p=await this.fetchClient.fetchRetry(r,{...n,retryOn:function(u,m,c){if(u>=o)return!1;let l=c==null?void 0:c.status;return m instanceof TypeError||l===_t||l!==void 0&&l>=bt},retryDelay:function(u,m,c,l){return console.warn(`Fetch attempt #${u}: input=${l}, error=${m==null?void 0:m.message}, response status=${c==null?void 0:c.status}, response status text=${c==null?void 0:c.statusText}`),Math.pow(2,u)*1e3}});if(p.status===Dt)throw new Error(`Unauthorized. Please check that your HAMMING_API_KEY is correct by visiting: ${this.baseURL}/settings`);return i&&console.debug(`Response for ${r}: ${p.status} ${p.statusText}
`),p}};var M=class{isSet;waiters;constructor(t=!1){this.isSet=t,this.waiters=[],t&&this.resolveWaiters()}set(){this.isSet=!0,this.resolveWaiters()}reset(){this.isSet=!1}wait(){return this.isSet?Promise.resolve():new Promise(t=>{this.waiters.push(t)})}resolveWaiters(){this.waiters.forEach(t=>t()),this.waiters=[]}};var At=512,O=class{client;queue=[];stopped=!1;queueHasMessages=new M;constructor(t){this.client=t}log(t){this.queue.push(t),this.queueHasMessages.set()}async start(){for(console.log("Starting logger thread..");!this.stopped;)await this.queueHasMessages.wait(),await this._processQueue();await this._processQueue(),console.log("Logger thread exited!")}stop(){console.log("Waiting for logger thread to exit.."),this.stopped=!0}_drainQueue(){let t=Math.min(this.queue.length,At);return this.queue.splice(0,t)}async _processQueue(){let t=this._drainQueue();await this._publish(t),this.queue.length===0&&this.queueHasMessages.reset()}async _publish(t){if(t.length!==0){process.env.NODE_ENV==="development"&&console.log(`Publishing ${t.length} message(s)..`);try{await this.client.fetch("/logs",{method:"POST",body:JSON.stringify({logs:t})}),process.env.NODE_ENV==="development"&&console.log(`Published ${t.length} messages!`)}catch(e){console.error(`Failed to publish messages: ${e}`)}}}};var d=class{prompt;vars;constructor(t){this.prompt=t,this.vars=this.extractVariables(t.chatMessages??[])}extractVariables(t){return(t.map(n=>n.content).join(`

`).match(/\{\{([^}]+)\}\}/g)??[]).map(n=>n.replace(/\{\{([^}]+)\}\}/g,"$1"))}compile(t){return{...this.prompt,chatMessages:this.prompt.chatMessages.map(e=>({...e,content:e.content.replace(/\{\{([^}]+)\}\}/g,(r,n)=>t[n]||r)}))}}};var kt=4096;function Nt(s){switch(s.choice){case"auto":return{type:"auto"};case"any":return{type:"any"};case"tool":return{type:"tool",name:s.functionName??""};default:throw new Error("Invalid tool choice type")}}function Lt(s){switch(s.role){case"user":return{role:"user",content:s.content};case"assistant":return{role:"assistant",content:s.content};default:throw new Error(`Unsupported role: ${s.role}`)}}function x(s){let t=s.chatMessages.find(r=>r.role==="system"),e=s.chatMessages.filter(r=>r.role!=="system");return{model:s.languageModel,system:t==null?void 0:t.content,messages:e.map(Lt),max_tokens:s.promptSettings.maxTokens??kt,top_p:s.promptSettings.topP,temperature:s.promptSettings.temperature,tools:s.tools?JSON.parse(s.tools):void 0,tool_choice:s.promptSettings.toolChoice&&s.tools?Nt(s.promptSettings.toolChoice):void 0}}var H=class{constructor(t){this.client=t}anthropic;async load(){if(this.anthropic)return this.anthropic;if(!this.client.anthropicApiKey)throw new Error("Anthropic API key is not set");let t=await import("@anthropic-ai/sdk");return this.anthropic=new t.Anthropic({apiKey:this.client.anthropicApiKey}),this.anthropic}async createMessage(t,e){if(!t.content)throw new Error("Prompt content is not set");let n=new d(t.content).compile(e||{}),i=await this.load(),o=x(n);return i.messages.create({...o,stream:!1})}async createMessageStream(t,e){if(!t.content)throw new Error("Prompt content is not set");let n=new d(t.content).compile(e||{}),i=await this.load(),o=x(n);return i.messages.create({...o,stream:!0})}},st=H;var F=class{constructor(t){this.client=t}anthropic;async load(){var e,r,n,i;if(this.anthropic)return this.anthropic;this.client.bedrock||console.log("Anthropic Bedrock config is not set. Using environment credentials.");let t=await import("@anthropic-ai/bedrock-sdk");return this.anthropic=new t.AnthropicBedrock({awsSecretKey:(e=this.client.bedrock)==null?void 0:e.awsSecretKey,awsAccessKey:(r=this.client.bedrock)==null?void 0:r.awsAccessKey,awsRegion:(n=this.client.bedrock)==null?void 0:n.awsRegion,awsSessionToken:(i=this.client.bedrock)==null?void 0:i.awsSessionToken}),this.anthropic}async createMessage(t,e){if(!t.content)throw new Error("Prompt content is not set");let n=new d(t.content).compile(e||{}),i=await this.load(),o=x(n);return i.messages.create({...o,stream:!1})}async createMessageStream(t,e){if(!t.content)throw new Error("Prompt content is not set");let n=new d(t.content).compile(e||{}),i=await this.load(),o=x(n);return i.messages.create({...o,stream:!0})}},it=F;var _=class{client;constructor(t){this.client=t}async load(t){let e=await this.client.fetch(`/datasets/${t}`,{method:"GET"}),r;try{r=await e.json()}catch(n){throw new Error(`Failed to parse dataset response as JSON for dataset ID: ${t}: ${n}`)}return r.dataset}async list(){return(await(await this.client.fetch("/datasets")).json()).datasets}async create(t){let{name:e,description:r,items:n}=t;return(await(await this.client.fetch("/datasets",{method:"POST",body:JSON.stringify({name:e,description:r,items:n})})).json()).dataset}};var ot=require("async_hooks"),y=new ot.AsyncLocalStorage;var G=(a=>(a.AccuracyAI="accuracy_ai",a.FactsCompare="facts_compare",a.ContextRecall="context_recall",a.ContextPrecision="context_precision",a.Hallucination="hallucination",a.StringDiff="string_diff",a.Refusal="refusal",a.SqlAst="sql_ast",a))(G||{}),K=(o=>(o.CREATED="CREATED",o.RUNNING="RUNNING",o.SCORING="SCORING",o.SCORING_FAILED="SCORING_FAILED",o.FINISHED="FINISHED",o.FAILED="FAILED",o))(K||{}),E=(r=>(r.OFF="off",r.MONITORING="monitoring",r.EXPERIMENT="experiment",r))(E||{}),U=(e=>(e.CALL="CALL",e.TEXT="TEXT",e))(U||{}),W=(r=>(r.STARTED="STARTED",r.COMPLETED="COMPLETED",r.FAILED="FAILED",r))(W||{}),at=(r=>(r.DEVELOPMENT="development",r.STAGING="staging",r.PRODUCTION="production",r))(at||{}),j=(t=>(t[t.MONITORING=1]="MONITORING",t))(j||{}),ct=(e=>(e.Numeric="numeric",e.Classification="classification",e))(ct||{}),V=(e=>(e.Local="local",e.Remote="remote",e))(V||{}),pt=(e=>(e.XML="xml",e.JSON="json",e))(pt||{}),mt=-1,J="<!--hamming_scoring_error-->",lt=(c=>(c.Gray="gray",c.LightGreen="light-green",c.LightBlue="light-blue",c.Amber="amber",c.Purple="purple",c.Pink="pink",c.Green="green",c.PastelGreen="pastel-green",c.Yellow="yellow",c.Blue="blue",c.Red="red",c))(lt||{}),b=(r=>(r.Root="root",r.Call="call",r.CallEvent="call_event",r))(b||{}),z=(e=>(e.Custom="custom",e.Retell="retell",e))(z||{}),B=(r=>(r.Started="call_started",r.Ended="call_ended",r.Analyzed="call_analyzed",r))(B||{});async function ut(s,t,e=100){let r=s.entries(),n=Math.min(e,s.length,100),i=Array(n).fill(r).map(async(o,p)=>{for(let[a,u]of o)process.env.NODE_ENV==="development"&&console.log(`Worker ${p} is processing task ${a}`),await t(u),process.env.NODE_ENV==="development"&&console.log(`Worker ${p} has finished task ${a}`)});await Promise.all(i)}var gt=10;function dt(s){return{tracing:{experiment:{itemId:s}}}}var qt=["string_diff"],X=class{client;constructor(t){this.client=t}async start(t,e,r){let o=(await(await this.client.fetch(`/experiments/${t.id}/items`,{method:"POST",body:JSON.stringify({datasetItemId:e.id,output:{},metrics:{},sampleId:r})})).json()).item,p=Date.now();return{item:o,startTs:p}}async end(t,e,r={},n=!1){let{item:i,startTs:o}=t,p=Date.now()-o;await this.client.tracing._flush(i.id),await this.client.fetch(`/experiments/${i.experimentId}/items/${i.id}`,{method:"PATCH",body:JSON.stringify({output:e,scores:r,metrics:{durationMs:p},failed:n})})}},D=class{client;items;constructor(t){this.client=t,this.items=new X(this.client)}async run(t,e){let{dataset:r}=t,n=await this.client.datasets.load(r);this.client.tracing._setMode("experiment");let{name:i=this.generateName(n.name),scoring:o=qt,metadata:p={},sampling:a}=t,u=a??1;if(u>gt)throw new Error(`The maximum number of samples is ${gt}.`);let m=new Q(this.client,o);await m.initialize();let c=await this.start(i,r,m.getConfig(),p,a),h=`${new URL(this.client.baseURL).origin}/experiments/${c.id}`;try{for(let w=0;w<u;w++)if(t.parallel){let C=async g=>{let I=await this.items.start(c,g,w);try{let f=await y.run(dt(I.item.id),async()=>e(g.input));if(!f||typeof f!="object")throw new Error(`Invalid output: ${f}`);let et=await m.score(g.input,g.output,f);await this.items.end(I,f,et)}catch(f){console.error(f);let vt={error:f instanceof Error?f.message:"Unknown error"};await this.items.end(I,vt,{},!0)}},v=typeof t.parallel=="number"?t.parallel:void 0;await ut(n.items,C,v)}else for(let C of n.items){let v=await this.items.start(c,C,w);try{let g=await y.run(dt(v.item.id),async()=>await e(C.input));if(!g||typeof g!="object")throw new Error(`Invalid output: ${g}`);let I=await m.score(C.input,C.output,g);await this.items.end(v,g,I)}catch(g){console.error(g);let f={error:g instanceof Error?g.message:"Unknown error"};await this.items.end(v,f,{},!0)}}}catch(w){throw await this.end(c,"FAILED"),w}finally{await this.end(c),console.log("See experiment results at:",h)}return{experimentUrl:h}}async start(t,e,r,n,i){let o="RUNNING";return(await(await this.client.fetch("/experiments",{method:"POST",body:JSON.stringify({name:t,dataset:e,status:o,scoring:r,metadata:n,sampling:i})})).json()).experiment}async end(t,e="FINISHED"){await this.client.fetch(`/experiments/${t.id}`,{method:"PATCH",body:JSON.stringify({status:e})})}generateName(t){return`Experiment for ${t} - ${new Date().toLocaleString()}`}},Q=class{client;standardScoring;customScoring;registeredFunctions=[];initialized=!1;constructor(t,e){this.client=t,this.standardScoring=e.filter(r=>typeof r=="string"),this.customScoring=e.filter(r=>typeof r!="string")}async initialize(){await this.registerScoringFunctions(),this.initialized=!0}getConfig(){if(!this.initialized)throw new Error("ScoringHelper is not initialized");return[...this.standardScoring,...this.registeredFunctions.map(t=>t.registration)]}async score(t,e,r){if(!this.initialized)throw new Error("ScoringHelper is not initialized");let n={},i=this.registeredFunctions.filter(o=>o.scorer.type==="local").map(async o=>{let p=o.scorer;try{n[o.registration.key_name]=await p.scoreFn({input:t,output:r,expected:e})}catch(a){console.error(`Failed to locally run score ${o.name.toLowerCase()}.`,"Note: This error will be displayed in the dashboard. All other scoring will be preserved and displayed accordingly.","Error received:",a),n[o.registration.key_name]={value:-1,reason:`${J}${a.message}`}}});return await Promise.allSettled(i),n}async registerScoringFunctions(){let t=this.customScoring.map(i=>({name:i.name,version:i.version,score_config:i.scoreConfig,execution_config:$t(i)})),n=(await(await this.client.fetch("/scoring/register-functions",{method:"POST",body:JSON.stringify({scoring:t})})).json()).scoring??[];this.registeredFunctions=this.customScoring.map((i,o)=>({...i,registration:n[o]}))}};function $t(s){if(s.scorer.type==="remote"){let{prompt:t,variableMappings:e,scoreParser:r}=s.scorer;return{kind:"remote",prompt:t,variableMappings:e,scoreParser:r}}return{kind:"local"}}var ft=require("lru-cache");function ht(s){let t=s.call.call_id;if(t&&typeof t=="string")return t}var S=class{_generationEvent(t){return{kind:"llm",...t}}_retrievalEvent(t){var o,p;let e=a=>typeof a=="string",r=(o=t.results)==null?void 0:o.every(e),n=a=>typeof a=="string"?{pageContent:a,metadata:{}}:a,i=r?(p=t.results)==null?void 0:p.map(n):t.results;return{kind:"vector",...t,results:i}}log(t,e){let r=typeof t=="string"?{[t]:e}:t;this.logEvent(r)}logGeneration(t){var r,n;let e={...t,metadata:{...t.metadata,error:((r=t.metadata)==null?void 0:r.error)||!!((n=t.metadata)!=null&&n.error_message)}};this.log(this._generationEvent(e))}logRetrieval(t){this.log(this._retrievalEvent(t))}},A=class extends S{client;collected={};currentLocalTraceId=0;mode="off";constructor(t){super(),this.client=t}_setMode(t){this.mode=t}nextTraceId(){return this.currentLocalTraceId++}async _flush(t){if(this.mode!=="experiment"){console.warn("Tracing mode must be set to <experiment>!");return}let e=this.collected[t]??[];delete this.collected[t];let r={id:this.nextTraceId(),experimentItemId:t,event:{kind:"root"}},n=[r];for(let i of e)n.push({id:this.nextTraceId(),experimentItemId:t,parentId:r.id,event:i});await this.client.fetch("/traces",{method:"POST",body:JSON.stringify({traces:n})})}_logLiveTrace(t){if(this.mode!=="monitoring"){console.warn("Tracing mode must be set to <monitoring>!");return}this.client._logger.log({type:1,payload:t})}logEvent(t){var r,n;let e=y.getStore();if(this.mode==="experiment"){let i=(n=(r=e==null?void 0:e.tracing)==null?void 0:r.experiment)==null?void 0:n.itemId;if(!i){console.error("Unable to log trace event without experiment item ID.");return}this.collected[i]||(this.collected[i]=[]),this.collected[i].push(t)}else if(this.mode==="monitoring"){let i=this.client.monitoring._getTraceContext(e);if(!i)return;this._logLiveTrace({event:t,...i})}else console.warn("Attempt to send a log trace, but tracing mode is off!")}};var Ht="INVALID_SESSION";function yt(s){return{tracing:{monitoring:{seqId:s}}}}var Y=class extends S{client;runCtx;constructor(t,e){super(),this.client=t,this.runCtx=yt(e)}logEvent(t){let e=this.client.monitoring._getTraceContext(this.runCtx);e&&this.client.tracing._logLiveTrace({event:t,...e})}},k=class{client;sessionId;seqId;input;output;metadata;metrics;status;errorMessage;startTs;itemType;tracing;constructor(t,e,r,n){this.itemType=n,this.client=t,this.sessionId=e,this.seqId=r,this.metrics={},this.tracing=new Y(t,r)}setInput(t){this.input=t}setOutput(t){this.output=t}setMetadata(t){this.metadata=t}end(t=!1,e){this._end(t,e)}_start(){this.startTs=Date.now(),this.status="STARTED"}_end(t=!1,e){this._hasEnded()||(this.metrics.duration_ms=Date.now()-this.startTs,this.status=t?"FAILED":"COMPLETED",this.errorMessage=e,this.client.monitoring._endItem(this._toTrace()))}_hasEnded(){return["COMPLETED","FAILED"].includes(this.status)}_toTrace(){return{session_id:this.sessionId,seq_id:this.seqId,parent_seq_id:void 0,event:{kind:this.itemType==="CALL"?"call":"root",input:this.input,output:this.output,metadata:this.metadata,metrics:this.metrics,status:this.status,error_message:this.errorMessage}}}},N=class{client;state=1;session;monitoringStartOpts;callEvents;constructor(t){this.client=t}start(t){this.monitoringStartOpts=t,this.client._logger.start(),this.client.tracing._setMode("monitoring"),this.state=0,this.callEvents=new ft.LRUCache({max:1e3,ttl:1e3*60*60*2}),console.log("Monitoring started!")}stop(){this.session=null,this.client.tracing._setMode("off"),this.client._logger.stop(),this.state=1,this.callEvents.clear(),console.log("Monitoring stopped!")}async runItem(t){await this._createSessionIfNotExist();let[e,r]=this._nextSeqId(),n=new k(this.client,e,r,"TEXT");n._start();try{let i=await y.run(yt(n.seqId),async()=>await t(n));return n.output||(i&&i instanceof Object&&!Array.isArray(i)?n.setOutput(i):n.setOutput({response:i})),n._end(),i}catch(i){throw n._end(!0,i.message),i}}async _startItem(t){await this._createSessionIfNotExist();let[e,r]=this._nextSeqId(),n=new k(this.client,e,r,t);return n._start(),n}async startItem(){return this._startItem("TEXT")}async _startCall(){return this._startItem("CALL")}_endItem(t){this.state!==1&&this.client.tracing._logLiveTrace(t)}_getTraceContext(t){var i,o;if(this.state===1)return null;if(!this.session)throw Error("Monitoring not started");let[e,r]=this._nextSeqId(),n=(o=(i=t==null?void 0:t.tracing)==null?void 0:i.monitoring)==null?void 0:o.seqId;return{session_id:e,seq_id:r,parent_seq_id:n}}async callEvent(t,e,r){switch(t){case"custom":throw Error("Custom call provider not implemented!");case"retell":await this.handleRetellCallEvent(e,r);break;default:throw Error(`Unsupported call provider: ${t}`)}}async handleRetellCallEvent(t,e={}){let r=ht(t);if(!r)throw Error("call_id is missing");let n;t.event==="call_started"?(n=await this._startCall(),n.tracing.log({kind:"call_event",event:t}),this.callEvents.set(r,n)):t.event==="call_ended"?(n=this.callEvents.get(r),n||(console.warn(`Missing call_started event for id: ${r}`),n=await this._startCall(),this.callEvents.set(r,n)),n.tracing.log({kind:"call_event",event:t}),n.setInput({provider:"retell"}),n.setMetadata(e),n.setOutput(t.call),n.end()):t.event==="call_analyzed"&&(n=this.callEvents.get(r),n?n.tracing.log({kind:"call_event",event:t}):(console.warn(`Missing call_started event for id: ${r}`),n=await this._startCall(),n.tracing.log({kind:"call_event",event:t}),n.end()))}_nextSeqId(){if(this.state===1)return[Ht,0];if(!this.session)throw Error("Monitoring not started");return this.session.seqId+=1,[this.session.id,this.session.seqId]}async _createSessionIfNotExist(){var n;if(this.state===1||this.session)return;let t=((n=this.monitoringStartOpts)==null?void 0:n.environment)??process.env.NODE_ENV,r=await(await this.client.fetch("/sessions",{method:"POST",body:JSON.stringify({metadata:t?{environment:t}:{}})})).json();this.session={id:r.id,seqId:0}}};var Ct=require("openai/streaming.mjs");var Z=class{constructor(t){this.client=t}openai;async load(){if(this.openai)return this.openai;if(!this.client.openaiApiKey)throw new Error("OpenAI API key not set. Initialize the Hamming client with an OpenAI API key.");let t=await import("openai");return this.openai=new t.OpenAI({apiKey:this.client.openaiApiKey}),this.openai}async createChatCompletion(t,e){if(!t.content)throw new Error("Prompt content not set");let n=new d(t.content).compile(e||{}),i=await this.load(),o=wt(n);return await this.client.monitoring.runItem(async a=>{a.setInput(o),a.setMetadata({sdk:{type:"openai_prompt",stream:!1,prompt:{slug:t.slug},variables:e}});let u={model:o.model,stream:!1,temperature:o.temperature??void 0,max_tokens:o.max_tokens??void 0,n:o.n??void 0,seed:o.seed??void 0};try{let m=await i.chat.completions.create({...o,stream:!1});return a.tracing.logGeneration({input:JSON.stringify(o),output:JSON.stringify(m),metadata:{...u,usage:m.usage}}),a.setOutput(m),m}catch(m){throw a.tracing.logGeneration({input:JSON.stringify(o),metadata:{...u,error:!0,error_message:m.message}}),m}})}async createChatCompletionStream(t,e){if(!t.content)throw new Error("Prompt content not set");let n=new d(t.content).compile(e||{}),i=await this.load(),o=wt(n),p=await this.client.monitoring.startItem();p.setInput(o),p.setMetadata({sdk:{type:"openai_prompt",stream:!0,prompt:{slug:t.slug},variables:e}});let a={model:o.model,stream:!0,temperature:o.temperature??void 0,max_tokens:o.max_tokens??void 0,n:o.n??void 0,seed:o.seed??void 0};try{let u=await i.chat.completions.create({...o,stream:!0});return new Ct.Stream(async function*(){let c=[];for await(let h of u)c.push(h),yield h;let l=c.length>0?c[c.length-1]:null;p.tracing.logGeneration({input:JSON.stringify(o),output:JSON.stringify({chunks:c}),metadata:{...a,usage:l==null?void 0:l.usage}}),p.setOutput({chunks:c}),p.end()},u.controller)}catch(u){throw p.tracing.logGeneration({input:JSON.stringify(o),metadata:{...a,error:!0,error_message:u.message}}),p.end(!0,u.message),u}finally{}}};function wt(s){return{model:s.languageModel,messages:s.chatMessages.map(t=>Ft(t)),temperature:s.promptSettings.temperature,max_tokens:s.promptSettings.maxTokens,top_p:s.promptSettings.topP,frequency_penalty:s.promptSettings.frequencyPenalty,presence_penalty:s.promptSettings.presencePenalty,tool_choice:s.promptSettings.toolChoice&&s.tools?Gt(s.promptSettings.toolChoice):void 0,tools:s.tools?JSON.parse(s.tools):void 0}}function Ft(s){switch(s.role){case"system":return{role:"system",content:s.content};case"user":return{role:"user",content:s.content};case"assistant":return{role:"assistant",content:s.content};default:throw new Error(`Unsupported message role: ${s.role}`)}}function Gt(s){switch(s.choice){case"none":return"none";case"auto":return"auto";case"function":return{type:"function",function:{name:s.functionName}};default:throw new Error(`Unsupported tool choice: ${s.choice}`)}}var It=Z;var L=class{constructor(t){this.client=t}async list(t){let e="/prompts";return t&&(e+=`?label=${t}`),(await(await this.client.fetch(e)).json()).prompts}async get(t,e,r){let n=`/prompts/${t}`;return e&&(n+=`?label=${e}`),r&&(n+=`&version=${r}`),(await(await this.client.fetch(n)).json()).prompt}};var xt=["apiKey","baseURL","openaiApiKey","anthropicApiKey","bedrock"],tt=class extends P{openaiApiKey;anthropicApiKey;bedrock;constructor(t){let e=Object.keys(t).filter(r=>!xt.includes(r));e.length>0&&console.warn(`WARNING: Unexpected config keys found: ${e.join(", ")}. Valid config keys are: ${xt.join(", ")}. The unexpected keys will be ignored.`),super({apiKey:t.apiKey,baseURL:t.baseURL??"https://app.hamming.ai/api/rest"}),this.openaiApiKey=t.openaiApiKey,this.anthropicApiKey=t.anthropicApiKey,this.bedrock=t.bedrock}experiments=new D(this);datasets=new _(this);tracing=new A(this);monitoring=new N(this);prompts=new L(this);openai=new It(this);anthropic=new st(this);anthropicBedrock=new it(this);_logger=new O(this)};0&&(module.exports={CallProvider,EventKind,ExperimentStatus,FunctionType,Hamming,LabelColor,LogMessageType,MonitoringItemStatus,MonitoringItemType,PromptTemplate,RetellCallEventType,ScoreParserType,ScoreType,ScorerExecutionType,ScoringErrorPrefix,ScoringErrorValue,SessionEnvironment,TracingMode});
//# sourceMappingURL=index.cjs.map