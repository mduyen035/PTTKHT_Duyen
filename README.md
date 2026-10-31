# HƯỚNG DẪN CÀI ĐẶT, CHẠY VÀ TRIỂN KHAI TRÊN GITHUB
## Hệ Thống Quản Lý Kho & Nguyên Vật Liệu — Trình Cà Phê

Tài liệu này hướng dẫn chi tiết cách chạy ứng dụng trên máy tính cá nhân (môi trường Local), cách đưa mã nguồn lên GitHub và cách phát hành trang web chạy trực tuyến miễn phí thông qua GitHub Pages.

---

## 1. Chuẩn bị môi trường máy tính

Trước khi bắt đầu, máy tính của bạn cần có:
- **Node.js**: Phiên bản 18 trở lên (khuyên dùng Node.js 20 LTS).
  - Tải tại: [https://nodejs.org/](https://nodejs.org/)
- **Git**: Công cụ quản lý mã nguồn (tải tại [https://git-scm.com/](https://git-scm.com/)).
- **Trình soạn thảo mã nguồn**: Khuyến nghị dùng **Visual Studio Code (VS Code)**.

---

## 2. Hướng dẫn chạy trên máy cá nhân (Local)

### Bước 1: Mở thư mục dự án
1. Giải nén tệp mã nguồn (nếu tải về dạng file ZIP) hoặc clone từ GitHub.
2. Mở thư mục dự án bằng **VS Code**.
3. Mở cửa sổ dòng lệnh Terminal trong VS Code bằng phím tắt `Ctrl + ` ` (hoặc menu `Terminal` -> `New Terminal`).

### Bước 2: Cài đặt các thư viện phụ thuộc
Chạy lệnh sau để tải các gói thư viện (React, Vite, Tailwind CSS...):
```bash
npm install
