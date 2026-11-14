'use strict';
// Optional AI layer: talk with interest groups before a decision, and a news-style ending report.
// Everything here degrades to written text when AI_ENDPOINT is empty or the API fails.
const AI_QUESTIONS_PER_TURN=3;
let chat={turn:-1,group:0,messages:[],asked:0,busy:false},reportRequest=null;
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c])}
const paragraphs=t=>t.split(/\n\s*\n|\n/).map(s=>s.trim()).filter(Boolean).map(s=>'<p>'+escapeHtml(s)+'</p>').join('');
async function aiPost(path,body,timeout=20000){if(!AI_ENDPOINT||typeof fetch!=='function')return null;const ctl=typeof AbortController==='function'?new AbortController():null,timer=ctl?setTimeout(()=>ctl.abort(),timeout):null;try{const r=await fetch(AI_ENDPOINT.replace(/\/+$/,'')+path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),signal:ctl?.signal});if(!r.ok)return null;const d=await r.json();return typeof d.text==='string'&&d.text.trim()?d.text.trim().slice(0,3000):null}catch{return null}finally{if(timer&&typeof clearTimeout==='function')clearTimeout(timer)}}
// Only what the player can already see is sent: option texts, current indices and past choices. Never option effects.
function chatPayload(group,messages){const c=currentCard();return {group,turn:state.turn,stats:[...state.stats],support:state.support[group],card:{title:c.title,q:c.q,options:c.options.map(o=>o.text)},past:state.history.filter(h=>h.reactions).slice(-8).map(h=>h.title+': '+h.text),messages}}
function fallbackReply(g){const top=g.w.map((w,i)=>[w,i]).filter(([w])=>w>0).sort((a,b)=>b[0]-a[0]).slice(0,2).map(([,i])=>labels[i].toLowerCase());return `Lúc này chúng tôi chưa bàn kỹ được. Điều chúng tôi để ý nhất là ${top.join(' và ')}; phương án nào giữ được những điều đó thì chúng tôi dễ đồng tình hơn.`}
function syncChat(){if(chat.turn!==state.turn)chat={turn:state.turn,group:chat.group,messages:[],asked:0,busy:false}}
function renderTalk(){$('talk').hidden=!AI_ENDPOINT;if(!AI_ENDPOINT)return;syncChat();const left=AI_QUESTIONS_PER_TURN-chat.asked,closed=state.ended||left<=0;
$('talk-groups').innerHTML=groups.map((g,i)=>`<button type="button" data-group="${i}" aria-pressed="${i===chat.group}">${g.name}</button>`).join('');
$('talk-log').innerHTML=chat.messages.map(m=>`<li class="${m.role}"><b>${m.role==='user'?'Bạn hỏi '+escapeHtml(groups[m.group].name):escapeHtml(groups[m.group].name)}</b>${escapeHtml(m.text)}</li>`).join('')+(chat.busy?`<li class="model pending"><b>${escapeHtml(groups[chat.group].name)}</b>Đang trả lời…</li>`:'');
$('talk-input').disabled=closed||chat.busy;$('talk-send').disabled=closed||chat.busy;
$('talk-note').textContent=(state.ended?'Nhiệm kỳ đã kết thúc.':left>0?`Còn ${left} câu hỏi cho quyết định này.`:'Bạn đã dùng hết câu hỏi cho quyết định này.')+' Câu trả lời do AI tạo, chỉ để tham khảo và không làm thay đổi chỉ số. Đừng nhập thông tin cá nhân.'}
function pickGroup(i){if(chat.busy||!Number.isInteger(i)||i<0||i>=groups.length)return;chat.group=i;renderTalk()}
async function askGroup(question){syncChat();const q=String(question||'').trim().slice(0,300);if(!AI_ENDPOINT||!q||chat.busy||state.ended||chat.asked>=AI_QUESTIONS_PER_TURN)return false;
const turn=state.turn,group=chat.group;chat.messages.push({group,role:'user',text:q});chat.asked++;chat.busy=true;$('talk-input').value='';renderTalk();
const history=chat.messages.filter(m=>m.group===group).slice(-6).map(m=>({role:m.role,text:m.text}));
const reply=await aiPost('/chat',chatPayload(group,history));
if(chat.turn!==turn||state.turn!==turn)return false;chat.busy=false;chat.messages.push({group,role:'model',text:reply||fallbackReply(groups[group]),fallback:!reply});renderTalk();if(!$('talk-input').disabled)$('talk-input').focus?.({preventScroll:true});return true}
function aiReportSection(){return `<section class="ai-report"><h3>Bản tin cuối nhiệm kỳ</h3><div id="ai-report-body">${state.aiReport?paragraphs(state.aiReport):'<p class="small">Đang viết bản tin…</p>'}</div><p class="small">Do AI viết dựa trên diễn biến nhiệm kỳ của bạn; có thể chưa chính xác.</p></section>`}
async function requestAiReport(contested){if(!AI_ENDPOINT||state.aiReport||reportRequest)return;const req=reportRequest={};
const text=await aiPost('/report',{endReason:endReason(),scenario:(sc=>sc.name+' ('+sc.level.toLowerCase()+'): '+sc.brief)(scenarioOf(state.scenario)),turn:state.turn,stats:[...state.stats],support:[...state.support],decisions:state.history.filter(h=>h.reactions).map(h=>({title:h.title,text:h.text})),contested:contested||''},30000);
if(reportRequest!==req)return;reportRequest=null;if(text){state.aiReport=text;save()}$('ai-report-body').innerHTML=text?paragraphs(text):'<p class="small">Chưa viết được bản tin lúc này. Báo cáo phía trên vẫn đầy đủ.</p>'}
