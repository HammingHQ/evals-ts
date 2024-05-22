import{a as d}from"./chunk-QS63ZJFN.js";import{a as c}from"./chunk-KN3XS55W.js";import{a as e}from"./chunk-GQSCBKA6.js";import{randomUUID as h}from"crypto";function g(o){return{tracing:{monitoring:{seqId:o}}}}var u=class extends d{constructor(s,n){super();e(this,"client");e(this,"runCtx");this.client=s,this.runCtx=g(n)}logEvent(s){let n=this.client.monitoring._getTraceContext(this.runCtx);this.client.tracing._logLiveTrace({event:s,...n})}},a=class{constructor(t,s,n){e(this,"client");e(this,"sessionId");e(this,"seqId");e(this,"input");e(this,"output");e(this,"metadata");e(this,"metrics");e(this,"status");e(this,"errorMessage");e(this,"startTs");e(this,"tracing");this.client=t,this.sessionId=s,this.seqId=n,this.metrics={},this.tracing=new u(t,n)}setInput(t){this.input=t}setOutput(t){this.output=t}setMetadata(t){this.metadata=t}end(t=!1,s){this._end(t,s)}_start(){this.startTs=Date.now(),this.status="STARTED"}_end(t=!1,s){this._hasEnded()||(this.metrics.duration_ms=Date.now()-this.startTs,this.status=t?"FAILED":"COMPLETED",this.errorMessage=s,this.client.monitoring._endItem(this._toTrace()))}_hasEnded(){return["COMPLETED","FAILED"].includes(this.status)}_toTrace(){return{session_id:this.sessionId,seq_id:this.seqId,parent_seq_id:void 0,event:{kind:"root",input:this.input,output:this.output,metadata:this.metadata,metrics:this.metrics,status:this.status,error_message:this.errorMessage}}}},m=class{constructor(t){e(this,"client");e(this,"session");this.client=t}start(){console.log("Monitoring started!"),this.session||(this.session={id:h(),seqId:0}),this.client._logger.start(),this.client.tracing._setMode("monitoring")}stop(){this.session=null,this.client.tracing._setMode("off"),this.client._logger.stop()}async runItem(t){let[s,n]=this._nextSeqId(),i=new a(this.client,s,n);i._start();try{let r=await c.run(g(i.seqId),async()=>await t(i));return i.output||(r&&r instanceof Object&&!Array.isArray(r)?i.setOutput(r):i.setOutput({response:r})),i._end(),r}catch(r){throw i._end(!0,r.message),r}}startItem(){let[t,s]=this._nextSeqId(),n=new a(this.client,t,s);return n._start(),n}_endItem(t){this.client.tracing._logLiveTrace(t)}_getTraceContext(t){if(!this.session)throw Error("Monitoring not started");let[s,n]=this._nextSeqId(),i=t?.tracing?.monitoring?.seqId;return{session_id:s,seq_id:n,parent_seq_id:i}}_nextSeqId(){if(!this.session)throw Error("Monitoring not started");return this.session.seqId+=1,[this.session.id,this.session.seqId]}};export{m as a};
//# sourceMappingURL=chunk-TGDFTA5I.js.map