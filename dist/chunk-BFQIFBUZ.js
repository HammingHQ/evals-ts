import{a as n}from"./chunk-GQSCBKA6.js";var a=class{constructor(t){n(this,"prompt");n(this,"vars");this.prompt=t,this.vars=this.extractVariables(t.chatMessages??[])}extractVariables(t){return(t.map(r=>r.content).join(`

`).match(/\{\{([^}]+)\}\}/g)??[]).map(r=>r.replace(/\{\{([^}]+)\}\}/g,"$1"))}compile(t){return{...this.prompt,chatMessages:this.prompt.chatMessages.map(e=>({...e,content:e.content.replace(/\{\{([^}]+)\}\}/g,(s,r)=>t[r]||s)}))}}};export{a};
//# sourceMappingURL=chunk-BFQIFBUZ.js.map