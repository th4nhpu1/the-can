const fs=require('fs'),vm=require('vm'),assert=require('assert');
const code=['groups','ai-config','ai'].map(f=>f==='ai-config'?"'use strict';const AI_ENDPOINT='';":fs.readFileSync('dist/'+f+'.js','utf8')).join('\n')+'\n'+fs.readFileSync('dist/policies.js','utf8')+'\n'+fs.readFileSync('dist/simple-decisions.js','utf8')+'\n'+fs.readFileSync('dist/extra-decisions.js','utf8')+'\n'+fs.readFileSync('dist/game.js','utf8');
function boot(saved){const els=new Map();const el=id=>{if(!els.has(id))els.set(id,{style:{},classList:{toggle(){}},addEventListener(){},showModal(){this.open=true},close(){this.open=false},open:false});return els.get(id)};let cache=saved;const ctx={document:{getElementById:el,querySelector:el,addEventListener(){}},localStorage:{getItem:()=>cache,setItem:(_,v)=>cache=v},setTimeout:fn=>fn()};vm.createContext(ctx);vm.runInContext(code,ctx);return {ctx,el,read:()=>JSON.parse(vm.runInContext('JSON.stringify(state)',ctx)),run:s=>vm.runInContext(s,ctx),cache:()=>cache}}
// Random decks keep only the opener fixed and survive reloads, including before a choice.
const deckGame=boot(),deck=deckGame.read().order;
assert.equal(deck.length,30);assert.equal(deck[0],0);assert.equal(new Set(deck).size,30);
assert.deepEqual(boot(deckGame.cache()).read().order,deck);
assert.equal(deckGame.el('title').textContent,deckGame.run('currentCard().title'));
const ascending=deckGame.run('createDecisionOrder(cards.length,30,[0],()=>0)');
const descending=deckGame.run('createDecisionOrder(cards.length,30,[0],()=>0.999)');
assert.notDeepEqual(Array.from(ascending),Array.from(descending));
assert(Array.from(ascending).some(i=>i>=30));
deckGame.run('choose(0)');assert.equal(deckGame.el('title').textContent,deckGame.run('cards[state.order[1]].title'));
assert.deepEqual(boot(deckGame.cache()).read().order,deck);
deckGame.run('reset()');assert.equal(deckGame.read().order[0],0);assert.equal(new Set(deckGame.read().order).size,30);
const legacy=boot(JSON.stringify({version:4,turn:8,stats:[60,60,60,60]}));
assert.deepEqual(legacy.read().order.slice(0,9),Array.from({length:9},(_,i)=>i));
assert.deepEqual(boot(legacy.cache()).read().order,legacy.read().order);
for(const order of [[0],Array(30).fill(0),[0,...Array.from({length:29},(_,i)=>i+100)]]){
 const repaired=boot(JSON.stringify({version:5,turn:2,stats:[60,60,60,60],order}));
 assert.equal(repaired.read().order.length,30);assert.equal(new Set(repaired.read().order).size,30);
 assert(repaired.read().order.every(i=>i>=0&&i<50));
}
assert(deckGame.run('cards.every(c=>c.options.length>=2&&c.options.length<=4&&c.options.every(o=>o.text&&o.why&&o.effect.length===4&&o.effect.every(Number.isFinite)))'));
console.log('Random decks, reload persistence, legacy migration, invalid-deck recovery, and 50-card content: pass');
let g=boot();assert.equal(g.run('cards.length'),50);g.run('state.order=Array.from({length:30},(_,i)=>i)');const firstPolicy=g.run('cards[0].options[0].policy.name');g.run('choose(0)');assert.equal(g.read().stats[0],52);assert.equal(g.read().lastDelta[0],-8);assert.equal(g.read().policies[0].years,3);g.run('choose(1)');assert.equal(g.read().pending.length,1);g.run('choose(0)');assert.equal(g.read().policies[0].years,2);assert(g.read().history.some(h=>h.kind==='annual'));for(let i=0;i<6;i++){g.run('state.stats=[70,70,70,70];choose(1)')}assert(g.read().history.some(h=>h.title==='Cơ sở thuế mở rộng'));assert(!g.read().policies.some(p=>p.name===firstPolicy));let resumed=boot(g.cache());assert.equal(resumed.read().turn,9);resumed.run('reset()');assert.equal(resumed.read().turn,0);assert.equal(resumed.read().policies.length,0);
let crisis=boot();crisis.run('state.stats=[1,1,1,1];choose(1)');assert(!crisis.read().ended);crisis.run('state.stats=[1,1,1,1];choose(1)');assert(crisis.read().ended);let count=crisis.read().turn;crisis.run('choose(0)');assert.equal(crisis.read().turn,count);
let seed=9231;function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
let finished=0,early=0,turns=[];for(let k=0;k<500;k++){let b=boot();for(let i=0;i<30&&!b.read().ended;i++){b.run(`choose(${Math.floor(rand()*b.run('currentCard().options.length'))})`);assert(b.read().stats.every(n=>n>=0&&n<=100))}assert(b.read().ended);turns.push(b.read().turn);if(b.read().turn===30)finished++;else early++}assert(finished>0&&early>0);console.log(JSON.stringify({cards:50,policyDuration:'pass',yearlyEffects:'pass',delayedEffects:'pass',saveResume:'pass',reset:'pass',crisisAndEndedLock:'pass',boundedStats:'pass',simulations:500,fullTerm:finished,earlyEnd:early,averageTurns:turns.reduce((a,b)=>a+b)/500}));

// Exercise every newly available third/fourth choice and reject out-of-range input.
let counts={2:0,3:0,4:0};for(let t=0;t<50;t++){let n=boot().run(`cards[${t}].options.length`);counts[n]++;for(let i=0;i<n;i++){let b=boot();b.run(`state.order[1]=${t};state.turn=1;choose(${i})`);assert.equal(b.read().turn,2);assert(!/[+-]\d/.test(b.el('choices').innerHTML));}}
let fourth=boot();fourth.run('choose(3)');assert.deepEqual(fourth.read().stats,[57,57,53,77]);let invalid=boot();invalid.run('choose(4);choose(-1)');assert.equal(invalid.read().turn,0);assert(!/pointerdown|pointermove|ArrowLeft|ArrowRight/.test(code));assert(counts[2]&&counts[3]&&counts[4]);console.log(JSON.stringify({choiceCounts:counts,allChoices:'pass',fourthChoice:'pass',invalidChoice:'pass',noSwipeOrArrowHandlers:'pass',hiddenDeltas:'pass'}));
assert(fourth.el('meters').innerHTML.includes('−3'));assert(fourth.el('meters').innerHTML.includes('+12'));assert(!boot().el('meters').innerHTML.includes('class="meter-delta'));assert(fourth.el('choices').innerHTML.indexOf('+12')<0);console.log('Post-decision meter deltas visible; option previews remain hidden.');

// Interest groups: reactions appear only after a decision, support accumulates, and the three early or final endings work.
let grp=boot();assert(!grp.el('groups').innerHTML.includes('class="stance'));grp.run('choose(0)');let gs=grp.read();assert.equal(gs.lastReactions.length,grp.run('groups.length'));assert.deepEqual(gs.history[0].reactions,gs.lastReactions);assert.equal(gs.support.length,gs.lastReactions.length);assert(grp.el('groups').innerHTML.includes('class="stance'));assert(!/stance|Ủng hộ|Phản đối/.test(grp.el('choices').innerHTML));assert(grp.el('log').innerHTML.includes('log-groups'));
let fresh0=boot();fresh0.run('resign()');assert(!fresh0.el('info').open);fresh0.run('confirmResign()');assert(!fresh0.read().ended);
let quit=boot();quit.run('choose(0);choose(1);resign()');assert(quit.el('info').open);quit.run('confirmResign()');assert(quit.read().ended);assert.equal(quit.read().endReason,'resign');assert(quit.el('ending-body').innerHTML.includes('Rời ghế giữa chừng'));assert(quit.el('ending-body').innerHTML.includes('Tình hình đất nước'));quit.run('choose(0)');assert.equal(quit.read().turn,2);
let riot=boot();riot.run('state.turn=6;state.stats=[60,60,60,60];state.support=state.support.map(()=>0);choose(1)');assert(!riot.read().ended);riot.run('state.stats=[60,60,60,60];state.support=state.support.map(()=>0);choose(1)');assert.equal(riot.read().endReason,'overthrow');assert(riot.el('ending-body').innerHTML.includes('Mất lòng dân'));
let v3=boot(JSON.stringify({turn:4,stats:[50,50,50,50],lastDelta:[0,0,0,0],policies:[],pending:[],history:[],crisis:[0,0,0,0],ended:false,version:3}));assert.equal(v3.read().turn,4);assert.equal(v3.read().support.length,v3.run('groups.length'));v3.run('choose(0)');assert.equal(v3.read().turn,5);
let legacyEnd=boot(JSON.stringify({turn:30,stats:[50,50,50,50],lastDelta:[0,0,0,0],policies:[],pending:[],history:[],crisis:[0,0,0,0],ended:true,version:3}));assert.equal(legacyEnd.run('endReason()'),'term');
let reasons={};for(let k=0;k<300;k++){let b=boot();while(!b.read().ended)b.run(`choose(${Math.floor(rand()*b.run('currentCard().options.length'))})`);const r=b.run('endReason()');reasons[r]=(reasons[r]||0)+1;assert(b.read().support.every(n=>n>=0&&n<=100))}assert(reasons.term&&reasons.crisis&&reasons.overthrow);console.log(JSON.stringify({groupReactions:'pass',resign:'pass',overthrow:'pass',v3SaveMigration:'pass',endReasons:reasons}));
let honeymoon=boot();for(let i=0;i<3;i++)honeymoon.run('state.stats=[60,60,60,60];state.support=state.support.map(()=>0);choose(1)');assert(!honeymoon.read().ended);console.log('First-year grace period: pass');

// AI layer: hidden without an endpoint; with one, only visible text is sent, replies are escaped, and failures fall back.
{let off=boot();assert.equal(off.el('talk').hidden,true);assert.equal(off.read().aiReport,null);}
function bootAi(fetchImpl){const els=new Map();const el=id=>{if(!els.has(id))els.set(id,{style:{},classList:{toggle(){}},addEventListener(){},showModal(){this.open=true},close(){this.open=false},open:false,value:''});return els.get(id)};let cache;const calls=[];const ctx={document:{getElementById:el,querySelector:el},localStorage:{getItem:()=>cache,setItem:(_,v)=>cache=v},setTimeout:fn=>fn(),fetch:(url,init)=>{calls.push({url,body:JSON.parse(init.body)});return fetchImpl(url,init)}};vm.createContext(ctx);vm.runInContext(code.replace("const AI_ENDPOINT='';","const AI_ENDPOINT='https://ai.test/';"),ctx);return {el,calls,run:s=>vm.runInContext(s,ctx),read:()=>JSON.parse(vm.runInContext('JSON.stringify(state)',ctx))}}
const okReply=text=>async()=>({ok:true,json:async()=>({text})});
(async()=>{
let a=bootAi(okReply('<img src=x onerror=alert(1)> Chúng tôi lo.'));assert.equal(a.el('talk').hidden,false);assert(a.el('talk-note').textContent.includes('Còn 3 câu hỏi'));
a.run('choose(0)');a.run('pickGroup(2)');assert.equal(await a.run("askGroup('  Các bạn nghĩ sao?  ')"),true);
let call=a.calls[0];assert.equal(call.url,'https://ai.test/chat');assert.deepEqual(Object.keys(call.body).sort(),['card','group','messages','past','stats','support','turn']);assert.equal(call.body.group,2);assert.equal(call.body.turn,1);assert.equal(call.body.card.title,a.run('currentCard().title'));
assert(call.body.card.options.every(o=>typeof o==='string'));assert(!JSON.stringify(call.body.card).match(/effect|\[-?\d/));assert.deepEqual(call.body.messages,[{role:'user',text:'Các bạn nghĩ sao?'}]);assert.equal(call.body.past.length,1);
assert(a.el('talk-log').innerHTML.includes('&lt;img'));assert(!a.el('talk-log').innerHTML.includes('<img'));
await a.run("askGroup('Câu 2')");assert.deepEqual(a.calls[1].body.messages.map(m=>m.role),['user','model','user']);await a.run("askGroup('Câu 3')");assert.equal(await a.run("askGroup('Câu 4')"),false);assert.equal(a.calls.length,3);assert.equal(a.el('talk-send').disabled,true);
assert.equal(await a.run("askGroup('   ')"),false);
a.run('choose(0)');assert(a.el('talk-note').textContent.includes('Còn 3 câu hỏi'));assert.equal(a.el('talk-log').innerHTML,'');
let fail=bootAi(async()=>({ok:false,json:async()=>({})}));await fail.run("askGroup('Hỏi')");assert(fail.el('talk-log').innerHTML.includes('chưa bàn kỹ được'));
let thrown=bootAi(async()=>{throw new Error('offline')});await thrown.run("askGroup('Hỏi')");assert(thrown.el('talk-log').innerHTML.includes('chưa bàn kỹ được'));
let release;let stale=bootAi(()=>new Promise(r=>{release=()=>r({ok:true,json:async()=>({text:'Muộn rồi'})})}));const pending=stale.run("askGroup('Hỏi')");stale.run('choose(1)');release();assert.equal(await pending,false);assert(!stale.el('talk-log').innerHTML.includes('Muộn rồi'));
let rep=bootAi(okReply('Kinh tế chững lại.\n\nLòng dân <b>chia rẽ</b>.'));rep.run('choose(0);choose(1);resign();confirmResign()');assert(rep.el('ending-body').innerHTML.includes('Bản tin cuối nhiệm kỳ'));await new Promise(r=>setImmediate(r));
let rc=rep.calls.find(c=>c.url.endsWith('/report'));assert.equal(rc.body.endReason,'resign');assert.equal(rc.body.decisions.length,2);assert(!JSON.stringify(rc.body.decisions).includes('effect'));
assert.equal(rep.read().aiReport,'Kinh tế chững lại.\n\nLòng dân <b>chia rẽ</b>.');assert.equal(rep.el('ai-report-body').innerHTML,'<p>Kinh tế chững lại.</p><p>Lòng dân &lt;b&gt;chia rẽ&lt;/b&gt;.</p>');
rep.run('showEnding()');assert.equal(rep.calls.filter(c=>c.url.endsWith('/report')).length,1);assert(rep.el('ending-body').innerHTML.includes('Kinh tế chững lại.'));
let repFail=bootAi(async()=>({ok:false}));repFail.run('choose(0);resign();confirmResign()');await new Promise(r=>setImmediate(r));assert(repFail.el('ai-report-body').innerHTML.includes('Chưa viết được'));assert.equal(repFail.read().aiReport,null);
console.log(JSON.stringify({aiHiddenWithoutEndpoint:'pass',aiChatPayload:'pass',aiEscaping:'pass',aiQuestionLimit:'pass',aiFallback:'pass',aiStaleReply:'pass',aiReport:'pass'}));
})().catch(e=>{console.error(e);process.exitCode=1});
