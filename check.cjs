require('./macro-check.cjs');
process.on('beforeExit',()=>{if(process.exitCode||globalThis.__apiDone)return;globalThis.__apiDone=true;require('child_process').execFileSync(process.execPath,['tests/api.test.mjs'],{stdio:'inherit'})});
