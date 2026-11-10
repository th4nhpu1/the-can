# Worker AI cho Thế Cân

Cloudflare Worker này giữ khóa Gemini ở phía máy chủ. Game gọi Worker cho hai việc:

- `POST /chat`: một nhóm lợi ích trả lời câu hỏi của người chơi về quyết định đang bàn.
- `POST /report`: bản tin ngắn khi nhiệm kỳ kết thúc.

Worker tự dựng lời nhắc. Nó chỉ nhận các trường của game và giới hạn độ dài từng trường, nên không ai dùng được khóa của bạn để hỏi Gemini chuyện khác. Worker chỉ trả lời các trang có tên trong `ALLOWED_ORIGINS` và giới hạn 20 yêu cầu mỗi phút cho mỗi IP. Giới hạn này tính riêng trên từng phiên bản Worker, nên chỉ có tác dụng ở mức tương đối.

## Triển khai lần đầu

Cần Node.js và một tài khoản Cloudflare (gói miễn phí là đủ).

1. Tạo khóa Gemini trong Google AI Studio. Giữ khóa cho riêng bạn, không dán vào mã nguồn.
2. Mở terminal trong thư mục `worker/`, đăng nhập Cloudflare:

   ```sh
   npx wrangler login
   ```

3. Lưu khóa thành secret. Lệnh sẽ hỏi bạn dán khóa vào:

   ```sh
   npx wrangler secret put GEMINI_API_KEY
   ```

4. Kiểm tra `ALLOWED_ORIGINS` trong `wrangler.toml` có đúng địa chỉ trang game, rồi triển khai:

   ```sh
   npx wrangler deploy
   ```

   Wrangler in ra địa chỉ dạng `https://the-can-ai.<tài-khoản>.workers.dev`.

5. Dán địa chỉ đó vào `dist/ai-config.js`:

   ```js
   const AI_ENDPOINT='https://the-can-ai.<tài-khoản>.workers.dev';
   ```

6. Đăng lại thư mục `dist/` lên nơi đang chạy game.

Khi `AI_ENDPOINT` để trống, khung chat bị ẩn và báo cáo cuối game chỉ dùng phần viết sẵn.

## Thay đổi cấu hình

Các biến nằm trong `[vars]` của `wrangler.toml`. Sửa xong thì chạy lại `npx wrangler deploy`.

| Biến | Ý nghĩa |
| --- | --- |
| `GEMINI_MODEL` | Tên mô hình Gemini, mặc định `gemini-3.5-flash` |
| `GEMINI_FALLBACK_MODEL` | Mô hình nhẹ dùng khi mô hình chính quá tải (503/429) hoặc quá chậm, ví dụ `gemini-3.1-flash-lite`. Để trống để tắt |
| `GEMINI_THINKING_BUDGET` | `0` tắt chế độ suy nghĩ để trả lời nhanh hơn; để trống nếu mô hình không hỗ trợ |
| `ALLOWED_ORIGINS` | Các địa chỉ trang được gọi Worker, cách nhau bằng dấu phẩy |

Muốn thử trên máy: chép `GEMINI_API_KEY=...` vào tệp `worker/.dev.vars` (tệp này đã được git bỏ qua), chạy `npx wrangler dev`, rồi đặt `AI_ENDPOINT` thành địa chỉ Wrangler in ra.

## Kiểm tra

```sh
node worker/test.mjs
```

Bộ kiểm tra dùng Gemini giả lập, không gọi mạng và không tốn hạn mức. `node check.cjs` ở thư mục gốc chạy cả bộ này.

## Lưu ý

- Gói miễn phí của Gemini giới hạn số lượt gọi mỗi phút và mỗi ngày. Nếu bị vượt, game tự dùng câu trả lời soạn sẵn.
- Ở gói miễn phí, Google có thể dùng dữ liệu gửi lên để cải thiện sản phẩm. Game nhắc người chơi không nhập thông tin cá nhân.
- Cuộc trò chuyện chỉ để tham khảo, không làm thay đổi chỉ số.
