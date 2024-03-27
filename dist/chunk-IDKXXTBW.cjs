"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _chunkDGYN466Bcjs = require('./chunk-DGYN466B.cjs');var _chunk7ARU3YXQcjs = require('./chunk-7ARU3YXQ.cjs');var _crypto = require('crypto');function g(o){return{tracing:{monitoring:{seqId:o}}}}var u=class{constructor(t,i,r){_chunk7ARU3YXQcjs.a.call(void 0, this,"monitoring");_chunk7ARU3YXQcjs.a.call(void 0, this,"sessionId");_chunk7ARU3YXQcjs.a.call(void 0, this,"seqId");_chunk7ARU3YXQcjs.a.call(void 0, this,"input");_chunk7ARU3YXQcjs.a.call(void 0, this,"output");_chunk7ARU3YXQcjs.a.call(void 0, this,"metadata");_chunk7ARU3YXQcjs.a.call(void 0, this,"metrics");_chunk7ARU3YXQcjs.a.call(void 0, this,"status");_chunk7ARU3YXQcjs.a.call(void 0, this,"errorMessage");_chunk7ARU3YXQcjs.a.call(void 0, this,"startTs");_chunk7ARU3YXQcjs.a.call(void 0, this,"tracing");this.monitoring=t,this.sessionId=i,this.seqId=r,this.metrics={}}setInput(t){this.input=t}setOutput(t){this.output=t}setMetadata(t){this.metadata=t}_start(){this.startTs=Date.now(),this.status="STARTED"}_end(t=!1,i){this._hasEnded()||(this.metrics.duration_ms=Date.now()-this.startTs,this.status=t?"FAILED":"COMPLETED",this.errorMessage=i,this.monitoring._endItem(this._toTrace()))}_hasEnded(){return["COMPLETED","FAILED"].includes(this.status)}_toTrace(){return{session_id:this.sessionId,seq_id:this.seqId,parent_seq_id:void 0,event:{kind:"root",input:this.input,output:this.output,metadata:this.metadata,metrics:this.metrics,status:this.status,error_message:this.errorMessage}}}},d= exports.a =class{constructor(t){_chunk7ARU3YXQcjs.a.call(void 0, this,"client");_chunk7ARU3YXQcjs.a.call(void 0, this,"session");this.client=t}start(){console.log("Monitoring started!"),this.session||(this.session={id:_crypto.randomUUID.call(void 0, ),seqId:0}),this.client._logger.start(),this.client.tracing._setMode("monitoring")}stop(){this.session=null,this.client.tracing._setMode("off"),this.client._logger.stop()}async runItem(t){let[i,r]=this._nextSeqId(),e=new u(this,i,r);e._start();try{let n=await _chunkDGYN466Bcjs.a.run(g(e.seqId),async()=>await t(e));return e.output||(n&&n instanceof Object&&!Array.isArray(n)?e.setOutput(n):e.setOutput({response:n})),e._end(),n}catch(n){throw e._end(!0,n.message),n}}_endItem(t){this.client.tracing._logLiveTrace(t)}_getTraceContext(){if(!this.session)throw Error("Monitoring not started");let[t,i]=this._nextSeqId(),e=_optionalChain([_chunkDGYN466Bcjs.a, 'access', _ => _.getStore, 'call', _2 => _2(), 'optionalAccess', _3 => _3.tracing, 'optionalAccess', _4 => _4.monitoring, 'optionalAccess', _5 => _5.seqId]);return{session_id:t,seq_id:i,parent_seq_id:e}}_nextSeqId(){if(!this.session)throw Error("Monitoring not started");return this.session.seqId+=1,[this.session.id,this.session.seqId]}};exports.a = d;
//# sourceMappingURL=chunk-IDKXXTBW.cjs.map