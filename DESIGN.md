---
name: Thế Cân
description: Sổ tay điều hành — gần gũi, có suy ngẫm.
colors:
  primary: "#193f37"
  background: "#f2f0e7"
  paper: "#fffcf3"
  muted: "#607067"
  line: "#cbd0c2"
  gold: "#c68b39"
  warning: "#aa513d"
  choice-hover: "#e1e6d7"
  choice-border: "#b8c3b2"
  meter-track: "#dce0d3"
typography:
  display:
    fontFamily: "Noto Serif, serif"
    fontSize: "clamp(48px, 5.2vw, 76px)"
    fontWeight: 400
    lineHeight: 1.16
    letterSpacing: "-2px"
  headline:
    fontFamily: "Noto Serif, serif"
    fontSize: "29px"
    fontWeight: 500
  title:
    fontFamily: "Noto Serif, serif"
    fontSize: "21px"
    fontWeight: 600
  body:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "14px"
    fontWeight: 400
  card-body:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "14px"
    lineHeight: 1.85
  choice:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "12px"
    lineHeight: 1.6
  label:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "11px"
rounded:
  card: "13px"
  button: "8px"
  primary-button: "7px"
  dialog: "14px"
spacing:
  small: "12px"
  medium: "24px"
  dialog: "35px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.paper}"
    rounded: "{rounded.primary-button}"
    padding: "14px 20px"
  button-choice:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.paper}"
    rounded: "{rounded.button}"
    padding: "16px 14px"
  button-choice-hover:
    backgroundColor: "{colors.choice-hover}"
  decision-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.primary}"
    rounded: "{rounded.card}"
    padding: "20px 27px 14px"
  dialog:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.primary}"
    rounded: "{rounded.dialog}"
    padding: "35px"
---

# Design System: Thế Cân

## Overview

**Creative North Star: "Sổ tay điều hành"**

Thế Cân mang tinh thần một sổ tay điều hành: gần gũi, dễ tiếp cận và dành chỗ cho suy ngẫm. Nền giấy kem, chữ xanh mực và điểm vàng đất giúp nội dung chính sách giữ vai trò trung tâm. Đồ họa hình khối đơn giản hỗ trợ nhận diện người trình bày mà không cạnh tranh với câu hỏi.

Các lớp giấy phân biệt thẻ đang chơi với bộ bài phía sau. Nút và thẻ nhẹ, rõ, dễ thao tác; chuyển động phản hồi hành động chọn. Đây là bản ghi thiết kế hiện có, không phải đề xuất đổi giao diện.

**Key Characteristics:**
- Giấy kem, xanh mực, vàng đất.
- Chân dung hình khối đơn giản, thẻ giấy xếp lớp.
- Chữ có chân cho giọng kể, chữ không chân cho thao tác.
- Phương án chỉ mô tả hành động và thời gian ảnh hưởng.

## Colors

Bảng màu ấm, trầm; màu sắc tạo thứ bậc đọc và báo trạng thái.

### Primary

**Xanh mực** (primary) dùng cho chữ chính, biểu tượng và phần đầy của thanh chỉ số. **Vàng đất** (gold) đánh dấu năm đang diễn ra và vòng focus. Cảnh báo dùng **đỏ gạch** (warning) khi chỉ số thấp hơn ngưỡng cảnh báo trong mã nguồn.

### Neutral

**Giấy kem** (background) là mặt bàn; **giấy sáng** (paper) là thẻ và hộp thoại. **Xanh chữ phụ** (muted) dành cho mô tả và thời gian; **đường phân cách giấy** (line) chia nhóm nội dung. Nút lựa chọn dùng choice-border và choice-hover; thanh dùng meter-track.

**The Ink Rule.** Giữ chữ chính và biểu tượng cùng giọng xanh mực; không dùng màu để hé lộ hướng tăng/giảm của một phương án.

## Typography

Noto Serif mang giọng kể cho tiêu đề; Be Vietnam Pro giữ điều khiển và nội dung tiếng Việt dễ đọc. Hai phông được tải qua Google Fonts; dự phòng hiện có lần lượt là serif và sans-serif.

- Tiêu đề mở đầu dùng display; ở ngưỡng tablet hiện tại chuyển về cỡ cố định (60px) và bị ẩn trên màn hình nhỏ.
- Tiêu đề hộp thoại dùng headline; câu hỏi dùng title; tên hội đồng dùng Noto Serif bán đậm (18px).
- Nội dung thẻ dùng card-body; nút lựa chọn dùng choice. Nhãn thời gian dùng label.
- Nhãn danh mục và trạng thái dùng cỡ (10px); dòng chân thẻ dùng cỡ (9px). Chữ phụ thông thường dùng (11–12px). Đây là số đo của bản hiện tại, không phải chứng nhận toàn bộ giao diện đã đạt chuẩn khả năng đọc.
- Các giá trị chỉ số dùng chữ số có độ rộng cố định (tabular-nums).

## Layout

Khung chính rộng tối đa (1450px), lề hai bên (5%). Màn hình lớn có ba vùng: giới thiệu, bàn chơi ở giữa, định hướng và nhật ký bên phải. Bàn chơi nằm trong cột giữa (360–470px), khoảng cột (5%).

Tại chiều rộng không quá (1100px), bố cục còn hai cột và vùng theo dõi chuyển xuống dưới, khoảng cột (4%). Định hướng và nhật ký được chia thành hai cột riêng trong vùng này. Tại chiều rộng không quá (850px), phần giới thiệu ẩn, bàn chơi trở thành một cột rộng tối đa (450px), lề ngang (6%). Mỗi câu có 2–4 phương án, xếp hai cột và cách nhau (12px); ở chiều rộng không quá (600px), chuyển thành một cột.

Thanh chỉ số có bốn cột. Trên màn nhỏ, định hướng và nhật ký xếp dọc, không cần cuộn ngang để đọc. Nhật ký cuộn dọc, cao tối đa (320px) ở màn lớn và (360px) ở màn nhỏ. Các cột dùng minmax(0, 1fr) để nội dung dài không làm tràn bố cục.

## Elevation & Depth

Độ nổi phục vụ cấu trúc giấy. Hai lớp sau thẻ xoay nhẹ (±2deg) cho thấy bộ bài. Mặt thẻ đang chơi có bóng thấp; hộp thoại có bóng sâu hơn và lớp nền tối để tập trung đọc.

- Bóng thẻ: (0 8px 23px #193f3710).
- Bóng hộp thoại: (0 24px 90px #0003).
- Lớp phủ hộp thoại: (#102e28a8).

**The Paper Layers Rule.** Dành độ nổi cho phân biệt các lớp giấy và hộp thoại; nội dung nhật ký nằm phẳng trên mặt nền.

## Shapes

Thẻ bo mềm theo card; nút theo button; hộp thoại theo dialog. Chân dung nằm trong khung tròn (101px), giảm còn (90px) trên màn nhỏ. Biểu tượng nét đơn giản, cùng màu mực; nút trợ giúp có dấu hỏi trong vòng tròn.

## Components

### Thẻ quyết định

Danh mục và số thẻ ở trên, tiếp đến chân dung, hội đồng, câu hỏi và dòng chân thẻ. Dùng decision-card; trên màn nhỏ đệm đổi thành (17px 23px 12px). Chiều cao tối thiểu lần lượt (395px) và (382px). Nội dung dài được phép làm thẻ cao thêm.

Thẻ là vùng đọc tĩnh, không kéo hoặc vuốt. Chọn xong, thẻ nhấc nhẹ theo chiều dọc và mờ trong (200ms); nội dung mới được thay sau (180ms). Giảm chuyển động vô hiệu các chuyển tiếp CSS.

### Nút lựa chọn

Các phương án cùng độ nổi, đánh dấu A–D: nền xanh mực, chữ giấy sáng, cỡ (13px) và đậm (600). Viền cùng màu nền, đệm theo button-choice; chiều cao tối thiểu (104px), tăng thành (112px) ở màn nhỏ. Hover dùng xanh mực sáng hơn, tái sử dụng màu hover của nút chính. Disabled giảm độ đậm (opacity 0.45). Mọi nút và thẻ có vòng focus vàng đất (3px), cách mép (5px). Nút trợ giúp, nút đóng, nút chính và liên kết kiến thức có vùng thao tác cao tối thiểu (44px).

Nhãn phụ chỉ ghi “Ảnh hưởng kéo dài n năm” khi có hiệu lực nhiều năm. Không hiện dự báo hay biến động số. Khi không có nhãn phụ, vùng trống này được ẩn.

### Chỉ số và thời gian

Bốn thanh với biểu tượng nét, tên và giá trị hiện tại. Track cao (5px); phần đầy đổi chiều rộng trong (400ms). Khi ở mức thấp, phần đầy đổi sang warning. Sau lượt chơi, hiện số cộng/trừ cạnh giá trị hiện tại: xanh mực khi tăng, đỏ gạch khi giảm, màu chữ phụ khi không đổi. Đây là biến động thực tế của cả lượt, không phải dự báo cho lựa chọn tiếp theo. Dãy chấm nhỏ dùng vàng đất cho tiến trình năm.

### Định hướng và nhật ký

Định hướng ghi tên và thời gian còn lại trên một mặt giấy sáng chung. Hai tiêu đề vùng theo dõi dùng serif bán đậm (21px); đường vàng đất phân biệt định hướng, đường xanh mực phân biệt nhật ký. Tên chính sách dùng (14px, 700). Nhật ký dùng đường phân cách, tiêu đề rõ hơn và diễn giải bằng lời; không hé lộ các số tác động, kể cả khi đọc lịch sử của bản lưu cũ. Sự kiện mới nhất có nền xanh nhạt đang dùng cho hover, giúp nhận ra điểm bắt đầu đọc. Danh sách trống có câu gợi mở bằng chữ serif nghiêng.

### Hộp thoại và nút chính

Hướng dẫn, góc kiến thức và kết thúc nhiệm kỳ dùng hộp thoại nền giấy sáng; bề rộng tối đa (540px), chiều cao tối đa (85dvh), nội dung dài cuộn được. Nút chơi lại dùng button-primary; nút văn bản giữ nền trong suốt, gạch chân khi hover.

### Điều hướng

Tên Thế Cân và biểu tượng cân là liên kết đầu trang. Khẩu hiệu có chân nhỏ cạnh tên, ẩn ở màn nhỏ; nút trợ giúp nằm bên phải. Chân trang gọn, chứa góc kiến thức và chú thích mô hình học tập.

Các phương án là nút gốc của trình duyệt. Sau khi chọn, tiêu đề câu tiếp theo nhận focus; Tab chuyển đến các nút và Enter hoặc phím cách chọn. Không có phím mũi tên chọn thay hoặc sự kiện vuốt trên thẻ.

## Do's and Don'ts

### Do:
- **Do** giữ câu hỏi và phương án là nội dung chính trên thẻ.
- **Do** dùng chữ Noto Serif cho tiêu đề và Be Vietnam Pro cho điều khiển tiếng Việt.
- **Do** giữ nhãn thời gian ảnh hưởng ngắn, không tiết lộ số tăng/giảm.
- **Do** giữ vòng focus nhìn thấy được và tôn trọng giảm chuyển động.

### Don't:
- **Don’t** dùng các con số tác động làm nội dung phụ cho phương án hoặc nhật ký.
- **Don’t** thêm lớp bảng hoặc thẻ trang trí vào bên trong thẻ quyết định.
- **Don’t** biến dải màu gợi ý trong hồ sơ thành màu trạng thái mới của game.
