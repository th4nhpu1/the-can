require('./macro-check.cjs');
process.on('beforeExit',()=>{if(process.exitCode||globalThis.__workerDone)return;globalThis.__workerDone=true;require('child_process').execFileSync(process.execPath,['worker/test.mjs'],{stdio:'inherit'})});
