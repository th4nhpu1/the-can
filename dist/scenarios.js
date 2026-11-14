'use strict';
// Starting contexts. Stats are [Đời sống, Sản xuất, Công bằng, Ngân sách]; support follows the order in groups.js.
// Like every number in the game, these are illustrative, not calibrated estimates.
const DEFAULT_SCENARIO='steady';
const scenarios=[
{id:'calm',name:'Thời kỳ thuận lợi',level:'Dễ',stats:[76,70,68,80],support:[64,64,64,64,64],
 brief:'Kinh tế vừa qua một giai đoạn tăng trưởng đều, ngân sách có dư. Hợp để làm quen với cách các quyết định tác động lẫn nhau.'},
{id:'steady',name:'Nền móng ổn định',level:'Vừa',stats:[60,60,55,65],support:[58,58,58,58,58],
 brief:'Các mặt phát triển khá đều nhưng chưa mặt nào thật vững. Đây là điểm xuất phát mặc định.'},
{id:'boom',name:'Tăng trưởng nóng',level:'Khó',stats:[55,75,32,60],support:[46,44,52,72,70],
 brief:'Vốn và nhà máy dồn về, nhưng thành quả tập trung ở một số nhóm và vùng. Phải chia lại cái bánh mà không dập tắt động lực sản xuất.'},
{id:'recovery',name:'Hậu khủng hoảng',level:'Rất khó',stats:[46,45,50,38],support:[50,52,50,46,42],
 brief:'Sau một cú sốc, sản xuất đình trệ, ngân sách cạn và nhiều gia đình chật vật. Nguồn lực ít, buộc phải chọn ưu tiên.'}
];
const scenarioOf=id=>scenarios.find(s=>s.id===id)||scenarios.find(s=>s.id===DEFAULT_SCENARIO);
