# Những ngày cũ — password-protected blog

Đây là một blog tĩnh có lớp mật khẩu phía trước. Nội dung bài viết được mã hóa bằng AES-GCM trước khi đưa lên GitHub Pages.

## Quan trọng
Đây là mô hình **client-side encryption**. Người biết mật khẩu mới có thể giải mã nội dung. Tuy nhiên, nếu bạn cần bảo mật cấp cao hơn (ví dụ chống sao chép nội dung sau khi mở), nên dùng hệ thống authentication phía server.

## Cách dùng
1. Tạo repository GitHub mới.
2. Upload toàn bộ file trong thư mục này.
3. Chạy `prepare_content.py` trên máy của bạn để tạo `content.enc.json`.
4. Xóa `posts.json` khỏi repository sau khi đã mã hóa (để tránh đăng nội dung dạng rõ).
5. Bật GitHub Pages: Settings → Pages → Deploy from branch → main → / (root).

Xem hướng dẫn chi tiết trong `SETUP.md`.
