# Bàn giao: AI Gemini cho Thế Cân (Cloudflare Worker)

Repo: `D:\the-can` (Windows), nhánh `main`.

## Mục tiêu

Game Thế Cân có lớp AI tùy chọn: người chơi hỏi các nhóm lợi ích trước khi quyết định (`POST /chat`) và nhận bản tin AI cuối nhiệm kỳ (`POST /report`). Lớp này gọi một Cloudflare Worker, Worker giữ khóa Gemini và gọi Gemini REST API.

## Trạng thái: đã chạy được

- Worker: `https://the-can-ai.thecan-game.workers.dev`. `/chat` (~3s) và `/report` (~6s) đều trả 200 với Gemini thật.
- Mô hình: `gemini-3.5-flash`, `GEMINI_THINKING_LEVEL = "low"`, placement `aws:us-east-1`.
- `dist/ai-config.js` đã trỏ tới Worker. `node worker/test.mjs` qua.

## Những lỗi đã gặp và cách xử lý (để khỏi lặp lại)

| Lỗi | Nguyên nhân | Cách xử lý |
| --- | --- | --- |
| 404 `gemini-2.5-flash no longer available` | Mô hình cũ ngừng cho người dùng mới | Đổi mô hình |
| 400 `User location is not supported` | Worker chạy ở edge gần người chơi (Đông Nam Á) | `[placement] region = "aws:us-east-1"` |
| Timeout 18s | `gemini-3.8-flash` treo (kiểm tra trực tiếp từ máy cũng treo, không phải lỗi Worker) | Đổi sang `gemini-3.5-flash` (~4s). `gemini-3.1-flash-lite` nhanh hơn (~1.3s) nếu cần |
| 400 `API key not valid` | Dán nhầm khóa khi `wrangler secret put` (khóa thật khoảng 39 ký tự) | Đặt lại secret |
| Câu trả lời bị cụt | Token "suy nghĩ" của Gemini 3.x tính vào `maxOutputTokens` | `GEMINI_THINKING_LEVEL = "low"`, tăng token chat 1000, report 2000 |

## Lưu ý bảo mật

Không ghi khóa vào mã hay file, không dán khóa vào chat. Đặt khóa bằng `npx.cmd wrangler secret put GEMINI_API_KEY` (trong `worker/`). Một khóa từng bị dán vào chat: nên xóa trong Google AI Studio và dùng khóa mới.

## Việc còn lại

1. Thử trong trình duyệt (`.claude/launch.json` có cấu hình `the-can`, `localhost:5174` đã nằm trong `ALLOWED_ORIGINS`).
2. Người dùng đăng lại thư mục `dist/` lên `https://the-can-chia-banh.tealcargo.chatgpt.site`.
3. Sau khi sửa `worker/`, chạy `npx.cmd wrangler deploy` trong `worker/`.
4. Windows: nếu `npx`/`node` không nhận, mở lại terminal hoặc dùng `npx.cmd`.
5. Không commit `.claude/`. Kết thúc thông điệp commit bằng `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.

## Tệp liên quan

- `worker/src/index.js`: Worker (`buildChat`, `buildReport`, `callGemini`, CORS, giới hạn tần suất)
- `worker/src/personas.js`: lời nhắc hệ thống của từng nhóm và phóng viên
- `worker/wrangler.toml`: mô hình, placement, biến môi trường, `ALLOWED_ORIGINS`
- `worker/test.mjs`: kiểm tra Worker bằng Gemini giả
- `worker/README.md`: hướng dẫn triển khai
- `dist/ai.js`, `dist/ai-config.js`: phía game (khung chat, bản tin cuối, địa chỉ Worker)
