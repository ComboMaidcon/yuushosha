# PRECHECK chatbot trên Vercel

## Cấu trúc
- `api/chat.js`: Edge Function, endpoint `POST /api/chat` với body `{"question": "..."}`.
- `package.json`: đặt `"type": "module"` để Vercel chạy file ES module.

## Triển khai
1. Tạo tài khoản Vercel miễn phí và cài CLI: `npm i -g vercel`.
2. Trong thư mục này chạy `vercel` và làm theo hướng dẫn (lần đầu tạo dự án).
3. Vào Settings → Environment Variables, thêm:
   - `GEMINI_API_KEY` (bí mật, lấy trong Google AI Studio)
   - `ALLOW_ORIGIN` (tên miền trang web, ví dụ `https://ten-cua-ban.vercel.app`)
   - `GEMINI_MODEL` (tên model Flash miễn phí, kiểm tra trong AI Studio)
4. Chạy `vercel --prod` để đưa lên môi trường chính thức.

## Kiểm tra nhanh
```
curl -X POST https://<ten-du-an>.vercel.app/api/chat -H 'content-type: application/json' -d '{"question":"Mã 3300 nghĩa là gì?"}'
```

## Ghi chú
- Khi chưa có `GEMINI_API_KEY`, API chỉ trả về các đoạn liên quan trong kho tri thức, không gọi mô hình và không tốn tiền.
- CORS hiện đặt `Access-Control-Allow-Origin` theo `ALLOW_ORIGIN`; nếu chưa đặt thì là `*`. Khi đưa lên mạng, nên đặt đúng tên miền trang web.

## Trang web + chatbot cùng dự án
- Các file HTML/CSS/JS ở thư mục gốc là trang PRECHECK (trang chủ, đăng nhập, dashboard).
- `chatbot.js` gọi `/api/chat` trước; nếu chưa có key hoặc lỗi, tự dùng bot luật có sẵn.
- Vì cùng tên miền, không cần cấu hình CORS.
