"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _chunk7ARU3YXQcjs = require('./chunk-7ARU3YXQ.cjs');var r=class{constructor(t){_chunk7ARU3YXQcjs.a.call(void 0, this,"client");this.client=t}async load(t){let a=await this.client.fetch(`/datasets/${t}`,{method:"GET"}),s;try{s=await a.json()}catch(e){throw new Error(`Failed to parse dataset response as JSON for dataset ID: ${t}: ${e}`)}return s.dataset}async list(){return(await(await this.client.fetch("/datasets")).json()).datasets}async create(t){let{name:a,description:s,items:e}=t;return(await(await this.client.fetch("/datasets",{method:"POST",body:JSON.stringify({name:a,description:s,items:e})})).json()).dataset}};exports.a = r;
//# sourceMappingURL=chunk-5XH5LYPL.cjs.map