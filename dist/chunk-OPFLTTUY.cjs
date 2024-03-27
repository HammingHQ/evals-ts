"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _chunkOG6MVXZIcjs = require('./chunk-OG6MVXZI.cjs');var _chunk7ARU3YXQcjs = require('./chunk-7ARU3YXQ.cjs');var a=512,o= exports.a =class{constructor(e){_chunk7ARU3YXQcjs.a.call(void 0, this,"client");_chunk7ARU3YXQcjs.a.call(void 0, this,"queue",[]);_chunk7ARU3YXQcjs.a.call(void 0, this,"stopped",!1);_chunk7ARU3YXQcjs.a.call(void 0, this,"queueHasMessages",new _chunkOG6MVXZIcjs.a);this.client=e}log(e){this.queue.push(e),this.queueHasMessages.set()}async start(){for(console.log("Starting logger thread..");!this.stopped;)await this.queueHasMessages.wait(),await this._processQueue();await this._processQueue(),console.log("Logger thread exited!")}stop(){console.log("Waiting for logger thread to exit.."),this.stopped=!0}_drainQueue(){let e=Math.min(this.queue.length,a);return this.queue.splice(0,e)}async _processQueue(){let e=this._drainQueue();await this._publish(e),this.queue.length===0&&this.queueHasMessages.reset()}async _publish(e){if(e.length!==0){process.env.NODE_ENV==="development"&&console.log(`Publishing ${e.length} message(s)..`);try{await this.client.fetch("/logs",{method:"POST",body:JSON.stringify({logs:e})}),process.env.NODE_ENV==="development"&&console.log(`Published ${e.length} messages!`)}catch(t){console.error(`Failed to publish messages: ${t}`)}}}};exports.a = o;
//# sourceMappingURL=chunk-OPFLTTUY.cjs.map