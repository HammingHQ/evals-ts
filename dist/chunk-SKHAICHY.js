import{a as u}from"./chunk-KN3XS55W.js";import{a as y}from"./chunk-3QRTNJLL.js";import{a as p}from"./chunk-GQSCBKA6.js";function f(d){return{tracing:{experiment:{itemId:d}}}}var S=["string_diff"],l=class{constructor(t){p(this,"client");this.client=t}async start(t,e){let a=(await(await this.client.fetch(`/experiments/${t.id}/items`,{method:"POST",body:JSON.stringify({datasetItemId:e.id,output:{},metrics:{}})})).json()).item,o=Date.now();return{item:a,startTs:o}}async end(t,e){let{item:n,startTs:i}=t,a=Date.now()-i;await this.client.tracing._flush(n.id),await this.client.fetch(`/experiments/${n.experimentId}/items/${n.id}`,{method:"PATCH",body:JSON.stringify({output:e,metrics:{durationMs:a}})})}},g=class{constructor(t){p(this,"client");p(this,"items");this.client=t,this.items=new l(this.client)}async run(t,e){let{dataset:n}=t,i=await this.client.datasets.load(n),{name:a=this.generateName(i.name),scoring:o=S,metadata:x={}}=t,r=await this.start(a,n,o,x),h=`${new URL(this.client.baseURL).origin}/experiments/${r.id}`;try{if(t.parallel){let s=async c=>{let w=await this.items.start(r,c),I=await u.run(f(w.item.id),async()=>e(c.input));await this.items.end(w,I)},m=typeof t.parallel=="number"?t.parallel:void 0;await y(i.items,s,m)}else for(let s of i.items){let m=await this.items.start(r,s),c=await u.run(f(m.item.id),async()=>await e(s.input));await this.items.end(m,c)}}catch(s){throw await this.end(r,"FAILED"),s}finally{await this.end(r),console.log("See experiment results at:",h)}return{experimentUrl:h}}async start(t,e,n,i){let a="RUNNING";return(await(await this.client.fetch("/experiments",{method:"POST",body:JSON.stringify({name:t,dataset:e,status:a,scoring:n,metadata:i})})).json()).experiment}async end(t,e="FINISHED"){await this.client.fetch(`/experiments/${t.id}`,{method:"PATCH",body:JSON.stringify({status:e})})}generateName(t){return`Experiment for ${t} - ${new Date().toLocaleString()}`}};export{g as a};
//# sourceMappingURL=chunk-SKHAICHY.js.map