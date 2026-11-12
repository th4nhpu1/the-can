'use strict';
function simplifyDecisions(cards,option){
const rows=[
['Ưu tiên đầu tiên','Trong ba năm đầu, cả nước nên dành nhiều nguồn lực hơn cho việc gì?','Mở rộng sản xuất, tạo thêm việc làm','Bảo đảm mức sống cơ bản','Xây thêm trường học và bệnh viện','Giữ một khoản tiền phòng khi khó khăn'],
['Ai đóng góp nhiều hơn?','Nhà nước cần tiền cho dịch vụ công, còn người làm ăn cũng cần vốn. Nên thay đổi cách thu thuế thế nào?','Người có thu nhập cao đóng góp nhiều hơn','Giảm thuế để khuyến khích làm ăn','Thu đủ khoản thuế đang bị bỏ sót'],
['Xây đường ở đâu trước?','Chỉ đủ tiền cho một chương trình đường sá lớn. Bạn chọn ưu tiên nào?','Nối các khu sản xuất lớn với cảng biển','Nối vùng xa với trường học, bệnh viện và chợ'],
['Tiền lương có theo kịp giá?','Giá sinh hoạt tăng trên cả nước. Bạn chọn cách giúp người làm công thế nào?','Tăng nhanh mức lương thấp nhất','Tăng lương từng bước để doanh nghiệp kịp thích ứng','Hỗ trợ tiền cho người lương thấp','Giảm một phần chi phí đi lại và khám bệnh'],
['Giá cả tăng nhanh','Giá hàng hóa tăng khiến người dân lo lắng. Cả nước nên ưu tiên việc gì?','Hạn chế cho vay để giảm sức mua và áp lực giá','Giữ vốn cho làm ăn, hỗ trợ giá hàng thiết yếu','Giúp thêm hàng hóa đến được thị trường'],
['Giúp ai trước?','Ngân sách hỗ trợ cuộc sống có hạn. Bạn chọn cách nào?','Mở hỗ trợ cơ bản cho nhiều người','Tập trung giúp những người khó khăn nhất'],
['Máy móc thay con người','Nhiều ngành muốn dùng máy thay lao động. Cần chuẩn bị thế nào?','Giúp doanh nghiệp mua máy sớm','Dạy nghề mới cho người lao động trước','Chỉ hỗ trợ đổi máy nếu có kế hoạch giữ việc','Hỗ trợ người mất việc trong lúc tìm nghề mới'],
['Giữ doanh nghiệp hay giữ việc?','Một số doanh nghiệp lớn đang lỗ và có nhiều lao động. Nhà nước nên làm gì?','Sắp xếp lại hoạt động, giúp người phải chuyển việc','Cấp thêm tiền để duy trì việc làm hiện tại','Cho thời hạn sửa cách làm trước khi hỗ trợ tiếp'],
['Giữ giá bữa ăn','Giá lương thực thay đổi mạnh. Cần làm gì để nguồn hàng ổn định hơn?','Giúp nông dân giảm tiền giống và phân bón','Xây kho dự trữ và cải thiện vận chuyển'],
['Chi tiêu khi thiếu tiền','Ngân sách chi nhiều hơn thu. Bạn chọn hướng nào trong những năm tới?','Giảm một phần chi để dành tiền dự phòng','Vay thêm cho công trình tạo việc làm','Tạm hoãn công trình ít cấp bách','Tăng đóng góp từ nhóm có khả năng chi trả'],
['Đất tăng giá, ai được lợi?','Đường sá mới làm giá đất tăng. Có nên dùng một phần lợi ích đó cho việc chung?','Thu thêm từ bất động sản giá trị cao','Giữ mức thu hiện tại để việc mua bán thuận lợi','Thu một phần tiền tăng thêm từ các khu đất được hưởng lợi'],
['Tiếng nói của người làm công','Khi bàn về lương và điều kiện làm việc, chính sách cả nước nên nghiêng về đâu?','Giúp người lao động thương lượng cùng nhau','Cho doanh nghiệp linh hoạt hơn khi tuyển và dùng người'],
['Đón nhà đầu tư mới','Nhiều doanh nghiệp nước ngoài muốn mở nhà máy. Bạn ưu tiên điều kiện nào?','Giảm nhiều thuế để họ mở nhà máy nhanh','Ưu đãi nếu họ dạy nghề và mua hàng trong nước','Ưu đãi nếu mở nhà máy tại vùng còn ít việc làm','Giữ ưu đãi vừa phải để còn tiền cho dịch vụ công'],
['Nhà ở cho người đi làm','Tiền thuê nhà ở các thành phố lớn ngày càng đắt. Cả nước nên hỗ trợ theo hướng nào?','Xây thêm nhà cho người thu nhập thấp thuê','Tạo điều kiện để xây nhiều nhà hơn','Hỗ trợ tiền thuê cho hộ đang khó khăn'],
['Tăng thu mà vẫn giữ động lực','Nhà nước cần thêm nguồn thu. Bạn chọn cách nào?','Thu thêm khi mua hàng hóa','Thu thêm từ phần lợi nhuận của doanh nghiệp'],
['Đơn hàng giảm trên cả nước','Nhiều nhà máy thiếu đơn hàng. Chính sách ứng phó nên ưu tiên điều gì?','Hỗ trợ doanh nghiệp giữ hoạt động và việc làm','Giúp người lao động chuyển sang nơi có việc','Tăng đặt hàng cho các công trình công cộng','Tập trung giúp hộ mất thu nhập vượt qua giai đoạn khó'],
['Đầu tư cho người học','Quỹ giáo dục chỉ đủ mở rộng mạnh một hướng. Bạn chọn hướng nào?','Đào tạo nhóm chuyên gia giỏi cho ngành mới','Mở rộng học nghề cho đông người','Giúp học sinh vùng khó khăn học tiếp'],
['Nông nghiệp lớn lên thế nào?','Nông dân cần làm ra nhiều hàng tốt hơn. Cả nước nên hỗ trợ cách nào?','Khuyến khích các vùng sản xuất quy mô lớn','Giúp các hộ cùng mua, cùng bán và chia sẻ máy móc'],
['Ai trả tiền khám bệnh?','Để nhiều người được khám chữa bệnh hơn, cả nước nên ưu tiên cách nào?','Nhà nước trả phần lớn hơn','Người đi khám trả thêm, hộ nghèo được miễn','Mở rộng bảo hiểm cho người chưa có','Ưu tiên tiền cho trạm y tế gần nơi người dân sống'],
['Chia tiền giữa các vùng','Các thành phố lớn tạo nhiều nguồn thu, còn vùng xa thiếu dịch vụ. Nên chia tiền thế nào?','Chuyển thêm tiền về các vùng khó khăn','Cho trung tâm kinh tế giữ lại nhiều tiền để phát triển','Ưu tiên những nơi thiếu trường học và bệnh viện nhất'],
['Doanh nghiệp lớn và nhỏ','Một số doanh nghiệp lớn có thể quyết định giá bán của cả thị trường. Bạn chọn hướng nào?','Ngăn họ chèn ép người mua và doanh nghiệp nhỏ','Hỗ trợ họ lớn mạnh để cạnh tranh với nước ngoài'],
['Tiền vay cho ai?','Nguồn tiền cho vay có hạn. Cả nước nên ưu tiên nhóm nào?','Doanh nghiệp nhỏ đang có phương án làm ăn','Các dự án lớn tạo thêm năng lực sản xuất','Nông hộ và người tự tạo việc làm','Chia vốn cho nhiều ngành để giảm rủi ro'],
['Điện hôm nay và ngày mai','Cả nước cần đủ điện với chi phí hợp lý. Bạn ưu tiên hướng nào?','Đổi nhanh sang nguồn điện ít ô nhiễm','Chuyển đổi chậm để giữ chi phí trước mắt','Đầu tư tiết kiệm điện trong nhà máy và hộ gia đình'],
['Có thêm tiền thu được','Kinh tế phục hồi giúp ngân sách thu tốt hơn. Khoản tăng thêm nên dành cho đâu?','Trả bớt nợ và để dành phòng khó khăn','Cải thiện trường học, bệnh viện và dịch vụ công'],
['Học lại để giữ việc','Nhiều công việc thay đổi nhanh. Ai nên trả tiền để người lao động học thêm?','Nhà nước mở quỹ cho mọi người có nhu cầu','Doanh nghiệp chi nhiều hơn để dạy nhân viên','Nhà nước, doanh nghiệp và người học cùng góp','Ưu tiên học miễn phí cho người đang mất việc'],
['Sau một đợt thiên tai lớn','Nhiều vùng vừa mất nhà cửa và sinh kế. Cần tập trung phục hồi theo cách nào?','Cứu trợ và khôi phục cuộc sống nhanh nhất','Xây lại để chống chịu tốt hơn trong tương lai','Giúp người dân có việc làm ngay trong quá trình xây lại'],
['Thành quả tăng trưởng','Khi doanh nghiệp làm ăn tốt hơn, chính sách nên khuyến khích điều gì?','Chia thêm lợi ích cho người lao động','Giữ thêm lợi nhuận để mở rộng sản xuất'],
['Khi nào dừng hỗ trợ?','Kinh tế đã khá hơn nhưng một số doanh nghiệp vẫn cần tiền hỗ trợ. Bạn làm gì?','Giảm dần hỗ trợ, giúp lao động chuyển việc','Gia hạn hỗ trợ để tránh mất việc đột ngột','Chỉ tiếp tục giúp doanh nghiệp có khả năng phục hồi','Chuyển hỗ trợ từ doanh nghiệp sang người mất thu nhập'],
['Cơ hội từ công nghệ','Công nghệ mở ra việc làm và cách kinh doanh mới. Cả nước nên đầu tư vào đâu?','Xây các trung tâm công nghệ lớn','Giúp nhiều vùng có mạng và biết sử dụng','Hỗ trợ doanh nghiệp nhỏ bán hàng và làm việc trực tuyến'],
['Để lại điều gì cho tương lai?','Nhiệm kỳ sắp kết thúc. Bạn muốn dành nguồn lực còn lại cho ưu tiên nào?','Nâng mức sống và cơ hội cho người dân','Giữ tiền và năng lực sản xuất cho những năm sau']
];
rows[29][0]='Dành nguồn lực cho tương lai';
rows[29][1]='Giữa nhu cầu hiện tại và khả năng phát triển lâu dài, bạn muốn dành nguồn lực cho ưu tiên nào?';
const effects={
0:[[4,2,7,-11],[-3,-3,-2,12]],1:[[0,2,5,7]],3:[[9,-2,7,-9],[7,2,5,-10]],4:[[-3,8,2,-8]],
6:[[2,7,5,-10],[10,-5,8,-11]],7:[[3,1,1,-6]],9:[[-4,-4,1,8],[1,-5,7,9]],10:[[1,-3,8,8]],
12:[[4,7,8,-10],[-2,4,2,7]],13:[[9,1,6,-9]],15:[[7,9,3,-15],[12,-5,10,-12]],16:[[7,-1,11,-10]],
18:[[9,1,9,-12],[8,2,7,-9]],19:[[5,-3,11,-8]],21:[[6,5,9,-10],[1,7,2,-6]],22:[[3,7,3,-9]],
24:[[5,6,5,-8],[9,1,10,-10]],25:[[8,7,5,-11]],27:[[1,4,2,-5],[10,-4,9,-10]],28:[[5,7,5,-8]]
};
const reasons={
0:['Nhiều người được tiếp cận học tập và chữa bệnh hơn; tiền để mở rộng sản xuất trước mắt ít đi.','Nhà nước có khoản dự phòng tốt hơn, nhưng một số nhu cầu hiện tại chưa được giải quyết.'],
1:['Thu đúng các khoản đã có giúp tăng tiền cho việc chung và giảm bất lợi cho người đóng đủ thuế. Việc kiểm tra cũng cần nguồn lực.'],
3:['Người lương thấp được giúp ngay mà doanh nghiệp chưa phải tăng toàn bộ quỹ lương; ngân sách phải chi thêm.','Bớt chi phí thiết yếu giúp tiền lương mua được nhiều hơn, nhưng dịch vụ cần thêm tiền để duy trì.'],
4:['Vận chuyển và nguồn hàng tốt hơn giúp giảm thiếu hàng. Kết quả cần thời gian và vốn đầu tư.'],
6:['Doanh nghiệp vẫn được đổi máy, nhưng phải tính đến việc làm của người đang làm việc. Tốc độ đổi mới chậm hơn.','Người mất việc có thời gian tìm hướng đi mới; ngân sách phải hỗ trợ trong lúc thu nhập bị gián đoạn.'],
7:['Doanh nghiệp có cơ hội sửa cách làm, nhưng ngân sách vẫn phải chờ xem họ có phục hồi được không.'],
9:['Giữ lại tiền cho việc cấp bách giúp ngân sách bớt căng; một số công trình và việc làm phải chờ.','Người có khả năng chi trả đóng góp thêm cho việc chung; phần tiền họ giữ để đầu tư giảm.'],
10:['Một phần lợi ích từ đường sá quay lại phục vụ cộng đồng. Người hưởng lợi từ đất còn ít tiền hơn để đầu tư nơi khác.'],
12:['Đầu tư đến vùng ít việc làm giúp mở rộng cơ hội, nhưng Nhà nước cần thêm tiền kết nối đường sá và dịch vụ.','Giữ nguồn thu cho việc chung, đổi lại một số nhà đầu tư chọn nơi có ưu đãi cao hơn.'],
13:['Hộ khó khăn bớt áp lực ngay. Nếu thiếu nhà lâu dài, ngân sách sẽ phải tiếp tục hỗ trợ tiền thuê.'],
15:['Đặt hàng công giúp doanh nghiệp có việc trong lúc thị trường yếu; ngân sách chịu phần chi lớn hơn.','Hộ mất thu nhập được bảo vệ, nhưng doanh nghiệp thiếu đơn hàng vẫn phải thu hẹp hoạt động.'],
16:['Nhiều học sinh có thể học tiếp, giúp giảm khoảng cách cơ hội. Đào tạo chuyên gia và các nhu cầu khác còn phải chờ.'],
18:['Nhiều người có chỗ dựa khi ốm đau; cần thêm nguồn đóng góp để quỹ bảo hiểm đủ chi.','Người dân khám gần nhà hơn, bớt đi lại và phát hiện bệnh sớm; cơ sở y tế vẫn cần tiền duy trì.'],
19:['Dịch vụ cơ bản đến những nơi thiếu nhất. Các trung tâm có ít tiền hơn để mở rộng ngay.'],
21:['Nhiều người có vốn tự tạo thu nhập; khoản cho vay nhỏ, phân tán cần theo dõi kỹ.','Vốn không phụ thuộc vào một vài dự án, nhưng khó tạo bước nhảy nhanh cho một ngành.'],
22:['Dùng ít điện hơn giúp giảm áp lực nguồn cung; hộ gia đình và nhà máy cần hỗ trợ đổi thiết bị.'],
24:['Các bên cùng chia chi phí học nghề, nhưng người có thu nhập thấp vẫn có thể khó góp phần của mình.','Người mất việc được học lại mà không phải lo học phí; ngân sách phải chi trước khi họ có thu nhập mới.'],
25:['Người dân có thu nhập khi tham gia xây lại quê hương. Ngân sách cần trả công và chuẩn bị việc phù hợp.'],
27:['Nguồn lực tập trung vào nơi có thể tự đứng vững; những doanh nghiệp khác vẫn có nguy cơ mất việc.','Người mất thu nhập được bảo vệ trực tiếp; doanh nghiệp không còn được giữ hoạt động bằng trợ cấp.'],
28:['Doanh nghiệp nhỏ tiếp cận thêm khách hàng và giảm chi phí giao dịch; chương trình hỗ trợ cần ngân sách.']
};
return cards.map((c,i)=>{const r=rows[i];c.title=r[0];c.q=r[1];c.options.forEach((o,j)=>{o.text=r[j+2];if(o.policy)o.policy.name=o.text;o.why=o.why.replaceAll('tái cơ cấu','sắp xếp lại hoạt động').replaceAll('tài khóa','ngân sách').replaceAll('cơ sở thuế','nguồn thu thuế').replaceAll('tái phân bổ','chuyển sang nơi cần hơn').replaceAll('phân phối lại','chia sẻ lại nguồn lực').replaceAll('tái đầu tư','đầu tư thêm').replaceAll('tích lũy','nguồn lực dành cho tương lai');});
for(let j=4;j<r.length;j++){const e=effects[i][j-4];c.options.push(option(r[j],e,reasons[i][j-4]));}
return c;});
}
