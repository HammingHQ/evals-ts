"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _chunk7ARU3YXQcjs = require('./chunk-7ARU3YXQ.cjs');var t=class{constructor(s=!1){_chunk7ARU3YXQcjs.a.call(void 0, this,"isSet");_chunk7ARU3YXQcjs.a.call(void 0, this,"waiters");this.isSet=s,this.waiters=[],s&&this.resolveWaiters()}set(){this.isSet=!0,this.resolveWaiters()}reset(){this.isSet=!1}wait(){return this.isSet?Promise.resolve():new Promise(s=>{this.waiters.push(s)})}resolveWaiters(){this.waiters.forEach(s=>s()),this.waiters=[]}};exports.a = t;
//# sourceMappingURL=chunk-OG6MVXZI.cjs.map