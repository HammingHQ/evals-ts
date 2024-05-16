import{a as u}from"./chunk-KN3XS55W.js";import{a as s}from"./chunk-GQSCBKA6.js";import{randomUUID as c}from"crypto";function g(a){return{tracing:{monitoring:{seqId:a}}}}var o=class{constructor(t,e,r){s(this,"monitoring");s(this,"sessionId");s(this,"seqId");s(this,"input");s(this,"output");s(this,"metadata");s(this,"metrics");s(this,"status");s(this,"errorMessage");s(this,"startTs");s(this,"tracing");this.monitoring=t,this.sessionId=e,this.seqId=r,this.metrics={}}setInput(t){this.input=t}setOutput(t){this.output=t}setMetadata(t){this.metadata=t}end(t=!1,e){this._end(t,e)}_start(){this.startTs=Date.now(),this.status="STARTED"}_end(t=!1,e){this._hasEnded()||(this.metrics.duration_ms=Date.now()-this.startTs,this.status=t?"FAILED":"COMPLETED",this.errorMessage=e,this.monitoring._endItem(this._toTrace()))}_hasEnded(){return["COMPLETED","FAILED"].includes(this.status)}_toTrace(){return{session_id:this.sessionId,seq_id:this.seqId,parent_seq_id:void 0,event:{kind:"root",input:this.input,output:this.output,metadata:this.metadata,metrics:this.metrics,status:this.status,error_message:this.errorMessage}}}},d=class{constructor(t){s(this,"client");s(this,"session");this.client=t}start(){console.log("Monitoring started!"),this.session||(this.session={id:c(),seqId:0}),this.client._logger.start(),this.client.tracing._setMode("monitoring")}stop(){this.session=null,this.client.tracing._setMode("off"),this.client._logger.stop()}async runItem(t){let[e,r]=this._nextSeqId(),n=new o(this,e,r);n._start();try{let i=await u.run(g(n.seqId),async()=>await t(n));return n.output||(i&&i instanceof Object&&!Array.isArray(i)?n.setOutput(i):n.setOutput({response:i})),n._end(),i}catch(i){throw n._end(!0,i.message),i}}startItem(){let[t,e]=this._nextSeqId(),r=new o(this,t,e);return r._start(),r}_endItem(t){this.client.tracing._logLiveTrace(t)}_getTraceContext(){if(!this.session)throw Error("Monitoring not started");let[t,e]=this._nextSeqId(),n=u.getStore()?.tracing?.monitoring?.seqId;return{session_id:t,seq_id:e,parent_seq_id:n}}_nextSeqId(){if(!this.session)throw Error("Monitoring not started");return this.session.seqId+=1,[this.session.id,this.session.seqId]}};export{d as a};
//# sourceMappingURL=chunk-LSODRKLW.js.map