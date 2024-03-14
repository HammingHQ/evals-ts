"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }var _chunkEHSPI4X3cjs = require('./chunk-EHSPI4X3.cjs');require('./chunk-ISY6W4AO.cjs');var _chunkSLNISFDVcjs = require('./chunk-SLNISFDV.cjs');var _chunkFGTP4Q3Tcjs = require('./chunk-FGTP4Q3T.cjs');var _chunkPBI6K26Gcjs = require('./chunk-PBI6K26G.cjs');require('./chunk-QBLTVT5Q.cjs');require('./chunk-4HL6JTL2.cjs');require('./chunk-Z6K3IXPN.cjs');var _chunk6PNYD2ZQcjs = require('./chunk-6PNYD2ZQ.cjs');require('./chunk-Z3M2WUHX.cjs');require('./chunk-RX5AAJX7.cjs');var _chunkSS6WUYGBcjs = require('./chunk-SS6WUYGB.cjs');require('./chunk-GPQNTDZB.cjs');require('./chunk-HIRXPJZF.cjs');var _chunk7ARU3YXQcjs = require('./chunk-7ARU3YXQ.cjs');var c=["apiKey","baseURL"],m= exports.Hamming =class extends _chunk6PNYD2ZQcjs.a{constructor(t){let i=Object.keys(t).filter(y=>!c.includes(y));i.length>0&&console.warn(`WARNING: Unexpected config keys found: ${i.join(", ")}. Valid config keys are: ${c.join(", ")}. The unexpected keys will be ignored.`);super({apiKey:t.apiKey,baseURL:_nullishCoalesce(t.baseURL, () => ("https://app.hamming.ai/api/rest"))});_chunk7ARU3YXQcjs.a.call(void 0, this,"experiments",new (0, _chunkPBI6K26Gcjs.a)(this));_chunk7ARU3YXQcjs.a.call(void 0, this,"datasets",new (0, _chunkFGTP4Q3Tcjs.a)(this));_chunk7ARU3YXQcjs.a.call(void 0, this,"tracing",new (0, _chunkEHSPI4X3cjs.a)(this));_chunk7ARU3YXQcjs.a.call(void 0, this,"monitoring",new (0, _chunkSS6WUYGBcjs.b)(this));_chunk7ARU3YXQcjs.a.call(void 0, this,"logger",new (0, _chunkSLNISFDVcjs.a)(this));this.logger.start()}};exports.Hamming = m;
//# sourceMappingURL=index.cjs.map