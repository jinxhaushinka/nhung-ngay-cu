# Cài blog lên GitHub Pages

## 1. Tạo repository
Vào GitHub và tạo một repository mới, ví dụ `nhung-ngay-cu`.

Upload:
- `index.html`
- `style.css`
- `app.js`
- `posts.json`
- `prepare_content.py`

## 2. Mã hóa bài viết
Trên máy tính cần Python 3.9+.

Chạy:
`python prepare_content.py`

Script sẽ hỏi mật khẩu và tạo `content.enc.json`.

Sau đó **xóa `posts.json`** trước khi push lên GitHub.

## 3. Bật GitHub Pages
Repository → Settings → Pages → Build and deployment → Source: Deploy from a branch → `main` → `/ (root)` → Save.

GitHub sẽ cấp cho bạn một địa chỉ dạng:
`https://TEN-TAI-KHOAN.github.io/nhung-ngay-cu/`

## 4. Thêm bài mới
Sửa `posts.json`, chạy lại:
`python prepare_content.py`

Sau đó thay `content.enc.json` trên GitHub.

### Lưu ý
Không commit mật khẩu vào repository. Nếu quên mật khẩu, nội dung đã mã hóa không thể khôi phục bằng cách "reset password"; bạn cần mã hóa lại từ bản gốc của mình.
