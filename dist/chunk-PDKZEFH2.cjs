"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _chunkWH63YPKDcjs = require('./chunk-WH63YPKD.cjs');var _chunkDGYN466Bcjs = require('./chunk-DGYN466B.cjs');var _chunk7ARU3YXQcjs = require('./chunk-7ARU3YXQ.cjs');var h="INVALID_SESSION";function m(o){return{tracing:{monitoring:{seqId:o}}}}var u=class extends _chunkWH63YPKDcjs.a{constructor(s,n){super();_chunk7ARU3YXQcjs.a.call(void 0, this,"client");_chunk7ARU3YXQcjs.a.call(void 0, this,"runCtx");this.client=s,this.runCtx=m(n)}logEvent(s){let n=this.client.monitoring._getTraceContext(this.runCtx);n&&this.client.tracing._logLiveTrace({event:s,...n})}},a=class{constructor(t,s,n){_chunk7ARU3YXQcjs.a.call(void 0, this,"client");_chunk7ARU3YXQcjs.a.call(void 0, this,"sessionId");_chunk7ARU3YXQcjs.a.call(void 0, this,"seqId");_chunk7ARU3YXQcjs.a.call(void 0, this,"input");_chunk7ARU3YXQcjs.a.call(void 0, this,"output");_chunk7ARU3YXQcjs.a.call(void 0, this,"metadata");_chunk7ARU3YXQcjs.a.call(void 0, this,"metrics");_chunk7ARU3YXQcjs.a.call(void 0, this,"status");_chunk7ARU3YXQcjs.a.call(void 0, this,"errorMessage");_chunk7ARU3YXQcjs.a.call(void 0, this,"startTs");_chunk7ARU3YXQcjs.a.call(void 0, this,"tracing");this.client=t,this.sessionId=s,this.seqId=n,this.metrics={},this.tracing=new u(t,n)}setInput(t){this.input=t}setOutput(t){this.output=t}setMetadata(t){this.metadata=t}end(t=!1,s){this._end(t,s)}_start(){this.startTs=Date.now(),this.status="STARTED"}_end(t=!1,s){this._hasEnded()||(this.metrics.duration_ms=Date.now()-this.startTs,this.status=t?"FAILED":"COMPLETED",this.errorMessage=s,this.client.monitoring._endItem(this._toTrace()))}_hasEnded(){return["COMPLETED","FAILED"].includes(this.status)}_toTrace(){return{session_id:this.sessionId,seq_id:this.seqId,parent_seq_id:void 0,event:{kind:"root",input:this.input,output:this.output,metadata:this.metadata,metrics:this.metrics,status:this.status,error_message:this.errorMessage}}}},g= exports.a =class{constructor(t){_chunk7ARU3YXQcjs.a.call(void 0, this,"client");_chunk7ARU3YXQcjs.a.call(void 0, this,"state",1);_chunk7ARU3YXQcjs.a.call(void 0, this,"session");_chunk7ARU3YXQcjs.a.call(void 0, this,"monitoringStartOpts");this.client=t}start(t){this.monitoringStartOpts=t,this.client._logger.start(),this.client.tracing._setMode("monitoring"),this.state=0,console.log("Monitoring started!")}stop(){this.session=null,this.client.tracing._setMode("off"),this.client._logger.stop(),this.state=1,console.log("Monitoring stopped!")}async runItem(t){await this._createSessionIfNotExist();let[s,n]=this._nextSeqId(),i=new a(this.client,s,n);i._start();try{let r=await _chunkDGYN466Bcjs.a.run(m(i.seqId),async()=>await t(i));return i.output||(r&&r instanceof Object&&!Array.isArray(r)?i.setOutput(r):i.setOutput({response:r})),i._end(),r}catch(r){throw i._end(!0,r.message),r}}async startItem(){await this._createSessionIfNotExist();let[t,s]=this._nextSeqId(),n=new a(this.client,t,s);return n._start(),n}_endItem(t){this.state!==1&&this.client.tracing._logLiveTrace(t)}_getTraceContext(t){if(this.state===1)return null;if(!this.session)throw Error("Monitoring not started");let[s,n]=this._nextSeqId(),i=_optionalChain([t, 'optionalAccess', _ => _.tracing, 'optionalAccess', _2 => _2.monitoring, 'optionalAccess', _3 => _3.seqId]);return{session_id:s,seq_id:n,parent_seq_id:i}}_nextSeqId(){if(this.state===1)return[h,0];if(!this.session)throw Error("Monitoring not started");return this.session.seqId+=1,[this.session.id,this.session.seqId]}async _createSessionIfNotExist(){if(this.state===1||this.session)return;let t=_nullishCoalesce(_optionalChain([this, 'access', _4 => _4.monitoringStartOpts, 'optionalAccess', _5 => _5.environment]), () => (process.env.NODE_ENV)),n=await(await this.client.fetch("/sessions",{method:"POST",body:JSON.stringify({metadata:t?{environment:t}:{}})})).json();this.session={id:n.id,seqId:0}}};exports.a = g;
//# sourceMappingURL=chunk-PDKZEFH2.cjs.map