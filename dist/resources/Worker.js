import"../chunk-GQSCBKA6.js";async function k(o,n,s=100){let t=o.entries(),i=Math.min(s,o.length,100),a=Array(i).fill(t).map(async(c,e)=>{for(let[r,l]of c)process.env.NODE_ENV==="development"&&console.log(`Worker ${e} is processing task ${r}`),await n(l),process.env.NODE_ENV==="development"&&console.log(`Worker ${e} has finished task ${r}`)});await Promise.all(a)}export{k as runWorkers};
//# sourceMappingURL=Worker.js.map