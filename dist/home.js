'use strict';
// Home screen: shown on every visit. The game keeps its saved state underneath,
// so the main button starts, resumes or reopens the last term depending on the save.
function renderHome(){
const playing=state.turn>0&&!state.ended,sc=scenarioOf(state.scenario);
$('home-start').textContent=state.ended?'Xem báo cáo nhiệm kỳ':playing?'Tiếp tục nhiệm kỳ':'Bắt đầu nhiệm kỳ';
$('home-new').hidden=!playing&&!state.ended;
$('home-note').textContent=state.ended?`Nhiệm kỳ trước (${sc.name}) đã khép lại sau ${state.turn} quyết định.`:playing?`Bạn đang ở quyết định ${Math.min(state.turn+1,30)}/30, năm ${Math.min(10,Math.floor(state.turn/3)+1)} · ${sc.name}. Tiến trình được lưu trên trình duyệt này.`:'Bạn sẽ chọn hoàn cảnh xuất phát, từ dễ đến rất khó. Tiến trình tự lưu trên trình duyệt này.'}
function showHome(){renderHome();document.body.classList.add('at-home');scrollTo(0,0)}
function enterGame(){document.body.classList.remove('at-home');scrollTo(0,0);if(state.ended)showEnding();else $('title').focus({preventScroll:true})}
// A fresh term asks for its starting context first; a term in progress or a finished one opens directly.
$('home-start').onclick=()=>{if(!state.turn&&!state.ended)scenarioPicker(enterGame);else enterGame()};
// Picking a context in the dialog is also the confirmation for replacing a term in progress.
$('home-new').onclick=()=>scenarioPicker(enterGame);
document.querySelector('.brand').onclick=e=>{e.preventDefault();showHome()};
renderHome();
