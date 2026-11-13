'use strict';
// Home screen: shown on every visit. The game keeps its saved state underneath,
// so the main button starts, resumes or reopens the last term depending on the save.
function renderHome(){
const playing=state.turn>0&&!state.ended;
$('home-start').textContent=state.ended?'Xem báo cáo nhiệm kỳ':playing?'Tiếp tục nhiệm kỳ':'Bắt đầu nhiệm kỳ';
$('home-new').hidden=!playing&&!state.ended;
$('home-note').textContent=state.ended?`Nhiệm kỳ trước đã khép lại sau ${state.turn} quyết định.`:playing?`Bạn đang ở quyết định ${Math.min(state.turn+1,30)}/30, năm ${Math.min(10,Math.floor(state.turn/3)+1)}. Tiến trình được lưu trên trình duyệt này.`:'Tiến trình tự lưu trên trình duyệt này.'}
function showHome(){renderHome();document.body.classList.add('at-home');scrollTo(0,0)}
function enterGame(){document.body.classList.remove('at-home');scrollTo(0,0);if(state.ended)showEnding();else $('title').focus({preventScroll:true})}
$('home-start').onclick=enterGame;
// A term in progress asks for confirmation first, through the game's own restart dialog.
$('home-new').onclick=()=>{if(state.ended){reset();enterGame();return}restart();const confirm=$('confirm-reset');if(confirm)confirm.onclick=()=>{reset();enterGame()}};
document.querySelector('.brand').onclick=e=>{e.preventDefault();showHome()};
renderHome();
