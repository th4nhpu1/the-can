# Thế Cân — Chia bánh, giữ lửa

Game mô phỏng quyết định kinh tế bằng tiếng Việt, phục vụ đồ án môn kinh tế chính trị. Người chơi điều hành một nền kinh tế giả lập qua 30 quyết định trong 10 năm, cân nhắc động lực sản xuất, đời sống, công bằng và ngân sách.

**Chơi trực tuyến:** [Thế Cân](https://the-can-chia-banh.tealcargo.chatgpt.site)

## Cách chơi

- Mỗi câu có 2–4 phương án; chọn bằng nút bấm hoặc bàn phím (Tab, Enter, phím cách).
- Không có thao tác vuốt. Phương án không tiết lộ trước mức tăng/giảm.
- Sau mỗi lượt, thanh chỉ số hiển thị thay đổi thực tế, gồm cả hệ quả đến hạn.
- Một số chính sách ảnh hưởng nhiều năm. Theo dõi định hướng và nhật ký để hiểu hệ quả.
- Sau mỗi quyết định, năm nhóm lợi ích (công nhân, nông dân, trí thức – sinh viên, doanh nghiệp tư nhân, nhà đầu tư nước ngoài) bày tỏ ủng hộ hay phản đối. Mức ủng hộ tích lũy qua các lượt.
- Nhiệm kỳ kết thúc khi đi hết 10 năm, khi một chỉ số khủng hoảng, khi mất lòng dân (từ năm thứ hai, lòng dân ≤40 trong hai lượt liên tiếp) hoặc khi người chơi từ chức.
- Khi bật AI, người chơi có thể hỏi các nhóm lợi ích tối đa 3 câu trước mỗi quyết định, và nhận thêm bản tin AI khi nhiệm kỳ kết thúc. Trò chuyện chỉ để tham khảo, không đổi chỉ số.
- Game tự lưu trong trình duyệt. Báo cáo cuối nhiệm kỳ mô tả tình hình kinh tế, xã hội, chính trị và quyết định gây tranh cãi nhất.

## Chạy trên máy

Đây là website HTML/CSS/JavaScript tĩnh, không cần cài thư viện hay bước build.

Mở `dist/index.html` trực tiếp trong trình duyệt, hoặc dùng Python:

```sh
python -m http.server 5174 --directory dist
```

Sau đó mở `http://localhost:5174`. Google Fonts cần Internet; khi ngoại tuyến trình duyệt dùng phông dự phòng.

## Bật AI (tùy chọn)

Game chạy đầy đủ khi không có AI. Để bật khung chat và bản tin AI (dùng Gemini), triển khai Cloudflare Worker trong thư mục `worker/` rồi điền địa chỉ vào `dist/ai-config.js`. Xem [worker/README.md](worker/README.md).

## Kiểm tra

Cài Node.js rồi chạy từ thư mục dự án:

```sh
node check.cjs
```

Bộ kiểm tra bao gồm các phương án 2–4 lựa chọn, lưu và khôi phục, chính sách nhiều năm, hệ quả chậm, điều kiện kết thúc, hiển thị cộng/trừ sau lượt, phản ứng nhóm lợi ích, từ chức, mất lòng dân, chuyển đổi bản lưu cũ 500 ván mô phỏng, khung chat AI và Worker (dùng Gemini giả lập).

## Cấu trúc

| Tệp | Vai trò |
| --- | --- |
| `dist/index.html` | Giao diện trò chơi |
| `dist/style.css` | Hệ thống màu, chữ và bố cục đáp ứng |
| `dist/game.js` | Vòng chơi, trạng thái, lưu tiến trình và kết thúc |
| `dist/groups.js` | Nhóm lợi ích, câu phản ứng và cách tính mức ủng hộ |
| `dist/ai-config.js` | Địa chỉ Worker AI; để trống thì tắt AI |
| `dist/ai.js` | Khung chat với các nhóm và bản tin AI cuối nhiệm kỳ |
| `worker/` | Cloudflare Worker gọi Gemini và hướng dẫn triển khai |
| `dist/policies.js` | Dữ liệu tác động chính sách và hệ quả |
| `dist/simple-decisions.js` | Câu hỏi dễ hiểu và các phương án bổ sung |
| `PRODUCT.md` | Mục đích và yêu cầu sản phẩm |
| `DESIGN.md` | Hồ sơ thiết kế “Sổ tay điều hành” |
| `macro-check.cjs` | Kiểm tra mô phỏng |

## Giới hạn mô hình

Các tình huống, nhân vật và mức tác động là giả định phục vụ học tập. Game không phải mô hình dự báo kinh tế Việt Nam và không chứng minh chính sách nào luôn đúng trong thực tế.
