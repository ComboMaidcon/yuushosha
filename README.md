# PRECHECK trên Vercel

## Cấu trúc
- `api/chat.js`: Edge Function cho **Hỏi PRECHECK**, nhận `{"question":"...","history":[]}` ở `POST /api/chat`.
- `expert-knowledge.js`: chủ đề và nguồn chính thức dùng chung giữa API và bản tĩnh. Khi sửa một chủ đề, đối chiếu cả nội dung, đường dẫn và ngày kiểm tra nguồn.
- `package.json`: đặt `"type": "module"` để Vercel chạy file ES module.

## Triển khai
1. Tạo tài khoản Vercel miễn phí và cài CLI: `npm i -g vercel`.
2. Trong thư mục này chạy `vercel` và làm theo hướng dẫn (lần đầu tạo dự án).
3. Vào Settings → Environment Variables, thêm:
   - `GEMINI_API_KEY` (bí mật, lấy trong Google AI Studio)
   - `ALLOW_ORIGIN` (chỉ cần khi có một frontend khác origin được phép gọi API)
   - `GEMINI_MODEL` (tùy chọn, mặc định `gemini-3.1-flash-lite`)
4. Chạy `vercel --prod` để đưa lên môi trường chính thức.

## Kiểm tra nhanh
```
curl -X POST https://<ten-du-an>.vercel.app/api/chat -H 'content-type: application/json' -d '{"question":"Tôm đông lạnh có cần FSVP không?"}'
```

## Ghi chú
- Khi chưa có `GEMINI_API_KEY` hoặc Gemini trả lỗi, API trả lời từ thư viện với chế độ `library`. Chế độ `model` dùng Gemini để tổng hợp các ghi chú phù hợp và chỉ gắn liên kết nằm trong danh mục nguồn.
- Website và API dùng cùng origin theo mặc định.
- **Hỏi PRECHECK** xử lý câu hỏi xuất khẩu thực phẩm sang Hoa Kỳ, trong đó mã từ chối và số liệu lịch sử tra từ tập dữ liệu cục bộ.

## Trang web + chatbot cùng dự án
- Các file HTML/CSS/JS ở thư mục gốc là trang PRECHECK (trang chủ, đăng nhập, dashboard).
- Có thể chạy `python -m http.server 8788` để xem trang tĩnh tại `http://127.0.0.1:8788/`. Tra cứu trên bản tĩnh dùng thư viện cục bộ.
- Luồng thử nhanh đi từ **Kiểm tra mới** đến **Vào nhanh bằng tài khoản demo**, rồi tiếp tục bản nháp trong cùng tab. App chỉ lưu tên tệp đính kèm. Sau khi tạo báo cáo, tìm theo tên sản phẩm hoặc mã hồ sơ ở **Báo cáo của tôi** và mở trực tiếp checklist.
- Tài khoản demo, báo cáo và tiến độ checklist nằm trong bộ nhớ cục bộ theo trình duyệt. Bản nháp nằm trong bộ nhớ của tab và được xóa khi tạo báo cáo, đăng xuất hoặc chọn **Xóa bản nháp**.

## Cập nhật bản tin trang chủ

Sửa các thẻ `article` trong mục `#ban-tin` của `index.html`. Đặt tin mới ở đầu, điền ngày nguồn công bố và liên kết đến bài gốc. Dùng `data-market="us"` cho Hoa Kỳ, `data-market="vn"` cho Việt Nam hoặc `data-market="us vn"` cho tin liên quan cả hai. Mỗi tin cần một `data-notice-id` riêng. Giữ nguyên mã khi sửa lỗi chính tả và đổi mã khi đăng một cập nhật mới để chuông báo lại. Đổi ngày tuyển chọn ở đầu mục sau khi làm mới danh sách.

Chuông lấy danh sách từ cùng mục bản tin và ghi nhớ trạng thái đã đọc trên trình duyệt. Muốn xem tin đang cập nhật tại cơ quan công bố, dùng các liên kết FDA và Bộ Công Thương dưới dải bản tin. Để chạy trang chủ cục bộ, dùng `python -m http.server 8788` và mở `http://127.0.0.1:8788/`.
