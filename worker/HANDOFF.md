# Bàn giao: bật AI Gemini cho Thế Cân (Cloudflare Worker)

Dùng file này để tiếp tục ở session khác. Repo: `/Users/hoangdy/Downloads/the-can`, nhánh `main`.

## Mục tiêu

Game Thế Cân có lớp AI tùy chọn: người chơi hỏi các nhóm lợi ích trước khi quyết định (`POST /chat`) và nhận bản tin AI cuối nhiệm kỳ (`POST /report`). Lớp này gọi một Cloudflare Worker, Worker giữ khóa Gemini và gọi Gemini REST API.

## Đã làm xong

- Mã game và Worker đã viết và có kiểm tra: `node check.cjs` (gồm `node worker/test.mjs`) đều qua.
- Phần mềm của giai đoạn 2 **chưa commit** (xem `git status`: `dist/ai.js`, `dist/ai-config.js`, `worker/`, và các tệp sửa).
- Worker đã triển khai: `https://the-can-ai.thecan-game.workers.dev` (tài khoản Cloudflare của người dùng, subdomain `thecan-game`).
- Secret `GEMINI_API_KEY` đã lưu bằng `npx wrangler secret put GEMINI_API_KEY`. Khóa cũ từng lộ trong ảnh chụp màn hình và người dùng đã được dặn xóa, tạo khóa mới. Không bao giờ ghi khóa vào mã hay file, không nhờ người dùng dán khóa vào chat.
- `OPTIONS /chat` từ origin của game trả về **204** (Worker chạy được, CORS đúng).
- `dist/ai-config.js` đã đặt `AI_ENDPOINT='https://the-can-ai.thecan-game.workers.dev'`.
- Trang game đã đăng: `https://the-can-chia-banh.tealcargo.chatgpt.site`. Cần đăng lại `dist/` sau khi mọi thứ chạy ổn.

## Đang kẹt

`POST /chat` gọi Gemini thật chưa thành công. Lần lượt đã gặp:

| Lỗi | Nguyên nhân | Đã sửa |
| --- | --- | --- |
| 404 `gemini-2.5-flash is no longer available to new users` | Mô hình cũ bị ngừng cho người dùng mới | Đổi `GEMINI_MODEL` sang `gemini-3.8-flash` (wrangler.toml, src/index.js, README) |
| 400 `User location is not supported for the API use` | Worker chạy ở edge gần người chơi (Đông Nam Á), Google chặn vùng đó | Thêm `[placement] region = "aws:us-east-1"` vào wrangler.toml |
| 524 rồi `TimeoutError` sau 18 giây | Gemini không trả lời | Thêm `AbortSignal.timeout(18000)` trong `callGemini`; đặt `GEMINI_THINKING_BUDGET = ""` (bỏ tham số `thinkingBudget`, vì nó viết cho Gemini 2.5) |

**Trạng thái hiện tại**: sau khi bỏ `thinkingBudget` và triển khai lại, `wrangler tail` vẫn báo `Gemini fetch failed TimeoutError`. Chưa rõ lỗi do mô hình `gemini-3.8-flash` chậm hoặc do đường đi từ vùng `aws:us-east-1` tới Google.

## Bước tiếp theo (chẩn đoán)

Gọi Gemini trực tiếp từ máy người dùng, không qua Worker, để tách nguyên nhân. Người dùng tự nhập khóa vào biến (khóa không vào chat):

```bash
read -s KEY
```

Liệt kê mô hình khóa này dùng được:

```bash
curl -s -m 30 -H "x-goog-api-key: $KEY" "https://generativelanguage.googleapis.com/v1beta/models?pageSize=100" | grep '"name"' | grep -i flash
```

Gọi thử và đo thời gian:

```bash
curl -s -m 60 -w "\n%{time_total}s\n" -H "x-goog-api-key: $KEY" -H "content-type: application/json" -d '{"contents":[{"role":"user","parts":[{"text":"Chào, trả lời một câu ngắn."}]}]}' "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent"
```

```bash
unset KEY
```

Cách đọc kết quả:

- **Trả lời nhanh**: mô hình ổn, lỗi nằm ở đường đi từ Worker. Thử đổi `region` trong `[placement]` sang `gcp:us-central1`, hoặc thử `[placement] mode = "smart"`, rồi `npx wrangler deploy`.
- **Cũng chậm hoặc treo**: đổi `GEMINI_MODEL` sang mô hình khác trong danh sách (ví dụ một bản `flash` hoặc `flash-lite` còn hiện).
- **Lỗi vị trí khi gọi trực tiếp**: máy người dùng bị chặn, cần cách khác cho Worker.

Nếu Gemini không dùng được, các hướng thay thế: Cloudflare Workers AI (không cần khóa ngoài, tiếng Việt yếu hơn), hoặc nhà cung cấp khác (Groq, OpenRouter). Mỗi hướng cần sửa `callGemini` và `worker/test.mjs`.

## Kiểm tra Worker sau khi sửa

Triển khai lại (chạy trong `worker/`):

```bash
npx wrangler deploy
```

Gọi thử thật, in kèm thời gian:

```bash
curl -s -m 40 -w "\n%{time_total}s\n" -X POST -H "Origin: https://the-can-chia-banh.tealcargo.chatgpt.site" -H "content-type: application/json" -d '{"group":0,"turn":2,"stats":[60,55,50,65],"support":52,"card":{"title":"Tiền lương","q":"Giá tăng, chọn cách nào?","options":["Tăng lương tối thiểu","Hỗ trợ tiền"]},"past":[],"messages":[{"role":"user","text":"Các anh chị nghĩ sao?"}]}' https://the-can-ai.thecan-game.workers.dev/chat
```

Thành công khi nhận `{"text":"..."}`. Xem log lỗi bằng `npx wrangler tail`, dòng cần tìm bắt đầu bằng `Gemini error` hoặc `Gemini fetch failed`.

Khi chat chạy, kiểm tra thêm `POST /report` với dữ liệu mẫu trong `worker/test.mjs`, xem giọng văn các nhóm có đúng persona (`worker/src/personas.js`) không.

## Việc còn lại sau khi AI chạy

1. Chạy `node check.cjs` để chắc mọi bài kiểm tra vẫn qua.
2. Thử trong trình duyệt (`.claude/launch.json` có cấu hình `the-can` chạy `python3 -m http.server 5174 --directory dist`; `localhost:5174` đã nằm trong `ALLOWED_ORIGINS`).
3. Người dùng đăng lại thư mục `dist/` lên trang game.
4. Commit giai đoạn 2 khi người dùng đồng ý. Không commit `.claude/`. Kết thúc thông điệp commit bằng:
   `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`

## Tệp liên quan

- `worker/src/index.js`: Worker (`buildChat`, `buildReport`, `callGemini`, CORS, giới hạn tần suất)
- `worker/src/personas.js`: lời nhắc hệ thống của từng nhóm và phóng viên
- `worker/wrangler.toml`: mô hình, placement, biến môi trường, `ALLOWED_ORIGINS`
- `worker/test.mjs`: kiểm tra Worker bằng Gemini giả
- `worker/README.md`: hướng dẫn triển khai
- `dist/ai.js`, `dist/ai-config.js`: phía game (khung chat, bản tin cuối, địa chỉ Worker)
