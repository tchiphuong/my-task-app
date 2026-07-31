# Release Notes v1.0.0 - My Task App

Tài liệu này tổng hợp các tính năng đã được xây dựng và hoàn thiện cho phiên bản phát hành đầu tiên (v1.0.0) của My Task App, đáp ứng hoàn toàn các yêu cầu đề ra.

## I. Mức độ đáp ứng Yêu Cầu Tiên Quyết (Core Requirements)

Ứng dụng đã hoàn thành xuất sắc 100% 5 yêu cầu cốt lõi từ `requirements.md`:

1. **Việc cần làm (Quản lý danh mục mới)**: Hoàn thiện tại trang **Tasks**, hỗ trợ đầy đủ các thao tác Thêm, Sửa, Xóa, đổi trạng thái qua bảng Kanban (Chưa làm / Đang làm / Đã xong), gắn cờ ưu tiên và phân loại thẻ.
2. **Việc chưa làm xong (Theo dõi & Nhắc nhở)**: Hoàn thiện tại trang **Dashboard** với thẻ cảnh báo đỏ cho "Việc chưa xong" và danh sách "Việc khẩn cấp & trễ hạn". Tại trang Tasks, các việc quá hạn cũng được tô viền đỏ cảnh báo.
3. **Việc hoàn thành mỗi ngày (Daily Habits)**: Hoàn thiện tại trang **Daily**, cho phép thiết lập và điểm danh thói quen hàng ngày. Tích hợp thanh lịch "Nhìn lại 7 ngày qua" và hệ thống đếm chuỗi kỷ luật (Streak) để duy trì động lực.
4. **Báo cáo tiến độ (Thời gian thực)**: Thanh tiến độ (Progress Bar) được tích hợp xuyên suốt ở Header và trang Dashboard, hiển thị % hoàn thành công việc theo thời gian thực mỗi khi đánh dấu xong một tác vụ.
5. **Báo cáo tổng 1 tháng (Năng suất & Xuất dữ liệu)**: Hoàn thiện tại trang **Reports**, vẽ biểu đồ thống kê chi tiết tỷ lệ hoàn thành công việc và thói quen trong 30 ngày qua. Tính toán "Điểm hiệu suất" tự động và cung cấp nút "Xuất báo cáo CSV" tải dữ liệu về thiết bị.

---

## II. Tính năng Kỹ thuật nổi bật & UI/UX

### 1. Thiết kế UI/UX & Hoạt ảnh (Animations)
- **Giao diện HeroUI**: Xây dựng toàn bộ giao diện bằng các component chuẩn của HeroUI (Card, Modal, Button, Chip) kết hợp Tailwind CSS.
- **Bottom Navigation (Mobile)**: Tích hợp hiệu ứng trượt (slide) mượt mà cho thanh điều hướng bằng `framer-motion` (`layoutId`), mang lại cảm giác native app cao cấp.

### 2. Đồng bộ dữ liệu Firebase (Data Sync)
- **Tích hợp Cloud Firestore**: Toàn bộ dữ liệu công việc (Tasks), thói quen (Daily Habits) và thông tin người dùng được lưu trữ và đồng bộ an toàn trên Firebase.
- **Cơ chế Offline-first**: Ứng dụng dùng Zustand để lưu trữ state cục bộ, giúp ứng dụng phản hồi ngay lập tức, trong khi tiến hành đồng bộ nền với Firebase. Đảm bảo dữ liệu không bị mất ngay cả khi xóa cache trình duyệt hay dùng tab ẩn danh.

### 3. Thiết kế Responsive "Web Ngang - Mobile Dọc"
Quy tắc thiết kế xuyên suốt để tối ưu không gian hiển thị trên mọi thiết bị:
- **Trang Tasks**: Hiển thị lưới Kanban đa cột (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`) trên màn hình lớn. Tự động thu về 1 cột trên điện thoại.
- **Trang Daily**: 
  - **Lịch nhìn lại 7 ngày**: Trượt ngang mượt mà (`overflow-x-auto`) ẩn scrollbar và rút gọn text (VD: "T2" thay vì "Thứ 2") trên Mobile. Duy trì lưới 7 cột rõ ràng trên Web.
  - **Danh sách thói quen**: Hiển thị lưới 2 cột (`sm:grid-cols-2`) trên Web, tận dụng tối đa chiều rộng.
- **Trang Dashboard**: Khối "Việc khẩn cấp & trễ hạn" dàn lưới 2 cột (`sm:grid-cols-2`) trên Web.

### 4. Tính năng an toàn (Safety & Validations)
- **Modal Xác nhận Xóa**: Mọi thao tác xóa dữ liệu quan trọng (Công việc, Thói quen) đều phải đi qua hộp thoại cảnh báo (`<ConfirmModal>`), ngăn chặn triệt để rủi ro thao tác nhầm của người dùng.

### 5. Quản lý source code
- **Tối ưu Git**: Đã thiết lập `.gitignore` loại trừ thư mục ảnh bằng chứng kiểm thử (`docs/evidence/`) để giữ cho kho lưu trữ mã nguồn nhẹ nhàng và sạch sẽ nhất.
