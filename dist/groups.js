'use strict';
// Interest groups. Weights apply to [Đời sống, Sản xuất, Công bằng, Ngân sách].
// Weights, population shares and quotes are illustrative, not calibrated estimates.
const groups=[
{name:'Công nhân',role:'Người làm công ở nhà máy, công trường',w:[1,.15,.7,0],pop:.35,popular:true,quotes:[
['Gánh nặng lại đổ lên vai người làm thuê. Anh em chúng tôi sẽ lên tiếng.','Lương không theo kịp, việc thì bấp bênh. Chúng tôi không chấp nhận.'],
['Quyết định này chưa nghĩ đến bữa cơm của người lao động.','Người làm công thấy thiệt nhiều hơn được.'],
['Chưa rõ tác động đến đồng lương. Chúng tôi sẽ theo dõi.','Được mất chưa rõ, cứ chờ xem.'],
['Có thêm chút yên tâm về việc làm và thu nhập.','Hướng này hợp lý với người làm công.'],
['Đúng điều người lao động mong đợi bấy lâu.','Anh em nhà máy đều phấn khởi.']]},
{name:'Nông dân',role:'Hộ sản xuất nông nghiệp và vùng xa',w:[.8,.1,1,0],pop:.4,popular:true,quotes:[
['Ruộng đồng, làng xóm lại bị bỏ lại phía sau.','Vùng xa chịu thiệt nhất, bà con khó mà đồng tình.'],
['Thành quả chưa về đến nông thôn.','Người làm nông thấy mình bị xếp sau.'],
['Ở quê chưa thấy gì thay đổi.','Bà con còn chờ xem kết quả thực tế.'],
['Bà con có thêm hy vọng về đường sá, trường trạm.','Một bước đi có tính đến nông thôn.'],
['Lần này vùng xa thật sự được nhìn đến.','Cả xã bàn tán vui vẻ về quyết định này.']]},
{name:'Trí thức, sinh viên',role:'Giáo viên, y bác sĩ và người đang học',w:[.5,.2,.8,.2],pop:.25,popular:true,quotes:[
['Cơ hội học hành và chữa bệnh bị thu hẹp. Đây là bước lùi.','Người trẻ thấy con đường phía trước hẹp lại.'],
['Lựa chọn này thiếu tầm nhìn dài hạn.','Chúng tôi lo cho chất lượng dịch vụ công.'],
['Cần thêm số liệu để đánh giá.','Có điểm được, có điểm chưa. Còn phải bàn.'],
['Một lựa chọn có cân nhắc, có lý lẽ.','Hướng đi này mở thêm cơ hội cho người trẻ.'],
['Đầu tư cho con người là đầu tư cho tương lai.','Giảng đường và bệnh viện đều đón nhận tích cực.']]},
{name:'Doanh nghiệp tư nhân',role:'Chủ cơ sở sản xuất, kinh doanh',w:[.1,1,-.3,.1],quotes:[
['Chi phí tăng, niềm tin giảm. Nhiều nơi sẽ thu hẹp sản xuất.','Làm ăn thế này thì khó giữ chân người lao động.'],
['Doanh nghiệp phải gồng thêm một gánh nặng.','Chúng tôi sẽ cân nhắc lại kế hoạch mở rộng.'],
['Tác động đến kinh doanh chưa rõ ràng.','Cứ giữ nhịp, chờ hướng dẫn cụ thể.'],
['Môi trường làm ăn có vẻ dễ thở hơn.','Có thêm lý do để đầu tư dài hạn.'],
['Một tín hiệu rất tốt cho sản xuất kinh doanh.','Chúng tôi sẵn sàng tuyển thêm người, mở thêm xưởng.']]},
{name:'Nhà đầu tư nước ngoài',role:'Vốn và công nghệ từ bên ngoài',w:[0,.7,-.2,.6],quotes:[
['Rủi ro tăng cao, dòng vốn sẽ tìm nơi khác.','Chúng tôi phải xem lại các cam kết đầu tư.'],
['Môi trường đầu tư kém ổn định hơn.','Nhà đầu tư đang chần chừ.'],
['Chúng tôi giữ nguyên kế hoạch, theo dõi thêm.','Chưa có gì thay đổi lớn với dòng vốn.'],
['Tín hiệu ổn định, đáng cân nhắc mở rộng.','Chính sách khá rõ ràng, dễ dự tính.'],
['Một điểm đến hấp dẫn cho vốn dài hạn.','Nhiều đối tác đang hỏi về cơ hội mới.']]}
];
const stances=['Phản đối mạnh','Phản đối','Dè dặt','Ủng hộ','Rất ủng hộ'];
const weightSum=g=>g.w.reduce((a,b)=>a+Math.abs(b),0);
// Groups judge a decision by its immediate effect plus half of what it promises later.
function groupImpact(o){const e=[...o.effect];if(o.policy)o.policy.effect.forEach((v,i)=>e[i]+=v*o.policy.years*.5);if(o.delayed)o.delayed.effect.forEach((v,i)=>e[i]+=v*.5);return e}
function groupReactions(o){const e=groupImpact(o);return groups.map(g=>Math.round(g.w.reduce((a,w,i)=>a+w*e[i],0)/weightSum(g)*10)/10)}
function stanceLevel(r){return r>=5?4:r>=1.5?3:r>-1.5?2:r>-5?1:0}
// What a group would think of the country as it stands, ignoring any single decision.
function groupBaseline(g,stats){return g.w.reduce((a,w,i)=>a+Math.abs(w)*(w>=0?stats[i]:100-stats[i]),0)/weightSum(g)}
// Support moves with each reaction (capped) and drifts toward how the group sees the country overall.
function updateSupport(support,reactions,stats){return support.map((s,i)=>Math.max(0,Math.min(100,Math.round(s+Math.max(-12,Math.min(12,reactions[i]*2))+(groupBaseline(groups[i],stats)-s)*.3))))}
function popularSupport(support){let sum=0,pop=0;groups.forEach((g,i)=>{if(g.popular){sum+=g.pop*support[i];pop+=g.pop}});return Math.round(sum/pop)}
function supportWord(s){return s>=70?'rất ủng hộ':s>=50?'ủng hộ':s>=35?'dè dặt':s>=20?'bất mãn':'phản đối gay gắt'}
