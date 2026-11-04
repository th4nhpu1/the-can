# Thế Cân — Chia bánh, giữ lửa

Game mô phỏng quyết định kinh tế bằng tiếng Việt, phục vụ đồ án môn kinh tế chính trị. Người chơi điều hành một nền kinh tế giả lập qua 30 quyết định trong 10 năm, cân nhắc động lực sản xuất, đời sống, công bằng và ngân sách.

**Chơi trực tuyến:** [Thế Cân](https://the-can-chia-banh.tealcargo.chatgpt.site)

## Cách chơi

- Mỗi câu có 2–4 phương án; chọn bằng nút bấm hoặc bàn phím (Tab, Enter, phím cách).
- Không có thao tác vuốt. Phương án không tiết lộ trước mức tăng/giảm.
- Sau mỗi lượt, thanh chỉ số hiển thị thay đổi thực tế, gồm cả hệ quả đến hạn.
- Một số chính sách ảnh hưởng nhiều năm. Theo dõi định hướng và nhật ký để hiểu hệ quả.
- Game tự lưu trong trình duyệt và có báo cáo cuối nhiệm kỳ.

## Chạy trên máy

Đây là website HTML/CSS/JavaScript tĩnh, không cần cài thư viện hay bước build.

Mở `dist/index.html` trực tiếp trong trình duyệt, hoặc dùng Python:

```sh
python -m http.server 5174 --directory dist
```

Sau đó mở `http://localhost:5174`. Google Fonts cần Internet; khi ngoại tuyến trình duyệt dùng phông dự phòng.

## Kiểm tra

Cài Node.js rồi chạy từ thư mục dự án:

```sh
node check.cjs
```

Bộ kiểm tra bao gồm các phương án 2–4 lựa chọn, lưu và khôi phục, chính sách nhiều năm, hệ quả chậm, điều kiện kết thúc, hiển thị cộng/trừ sau lượt và 500 ván mô phỏng.

## Cấu trúc

| Tệp | Vai trò |
| --- | --- |
| `dist/index.html` | Giao diện trò chơi |
| `dist/style.css` | Hệ thống màu, chữ và bố cục đáp ứng |
| `dist/game.js` | Vòng chơi, trạng thái, lưu tiến trình và kết thúc |
| `dist/policies.js` | Dữ liệu tác động chính sách và hệ quả |
| `dist/simple-decisions.js` | Câu hỏi dễ hiểu và các phương án bổ sung |
| `PRODUCT.md` | Mục đích và yêu cầu sản phẩm |
| `DESIGN.md` | Hồ sơ thiết kế “Sổ tay điều hành” |
| `macro-check.cjs` | Kiểm tra mô phỏng |

## Giới hạn mô hình

Các tình huống, nhân vật và mức tác động là giả định phục vụ học tập. Game không phải mô hình dự báo kinh tế Việt Nam và không chứng minh chính sách nào luôn đúng trong thực tế.
