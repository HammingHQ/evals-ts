"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }var _chunk7ARU3YXQcjs = require('./chunk-7ARU3YXQ.cjs');var a=class{constructor(t){_chunk7ARU3YXQcjs.a.call(void 0, this,"prompt");_chunk7ARU3YXQcjs.a.call(void 0, this,"vars");this.prompt=t,this.vars=this.extractVariables(_nullishCoalesce(t.chatMessages, () => ([])))}extractVariables(t){return(_nullishCoalesce(t.map(r=>r.content).join(`

`).match(/\{\{([^}]+)\}\}/g), () => ([]))).map(r=>r.replace(/\{\{([^}]+)\}\}/g,"$1"))}compile(t){return{...this.prompt,chatMessages:this.prompt.chatMessages.map(e=>({...e,content:e.content.replace(/\{\{([^}]+)\}\}/g,(s,r)=>t[r]||s)}))}}};exports.a = a;
//# sourceMappingURL=chunk-FECCBD2B.cjs.map