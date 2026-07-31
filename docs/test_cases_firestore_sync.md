# Kịch bản kiểm thử (Test Cases): Đồng bộ dữ liệu Firebase

Tài liệu này bao gồm các trường hợp kiểm thử (Test Cases) để xác minh tính năng lưu trữ và đồng bộ dữ liệu công việc (Tasks) giữa frontend và Firebase Firestore đã hoạt động chính xác sau khi được khắc phục.

---

## 1. TC01: Lưu công việc mới vào Firestore
- **Mục đích**: Xác nhận công việc mới được đẩy lên cơ sở dữ liệu thành công.
- **Tiền điều kiện**: 
  - Người dùng đã đăng nhập bằng tài khoản Google.
  - Đang ở trang Quản lý công việc (`/tasks`).
- **Các bước thực hiện**:
  1. Bấm nút **"Thêm công việc"**.
  2. Điền đầy đủ thông tin: Tiêu đề ("Test Task 1"), Độ ưu tiên, Ngày hết hạn.
  3. Bấm **Lưu**.
- **Kết quả mong đợi**:
  - Giao diện hiển thị công báo "Tạo việc thành công".
  - Công việc "Test Task 1" xuất hiện ngay lập tức trên danh sách.
  - (Kỹ thuật) Mở tab Network/Firebase Console, xác nhận có document mới được tạo trong collection `users/{email}/tasks`.

---

## 2. TC02: Đồng bộ thời gian thực (Real-time Sync) khi có thay đổi
- **Mục đích**: Kiểm tra cơ chế `onSnapshot` (ống hút dữ liệu) có tự động cập nhật UI khi database thay đổi hay không.
- **Tiền điều kiện**: 
  - Đang mở tab trình duyệt ở trang `/tasks`.
- **Các bước thực hiện**:
  1. Mở một tab trình duyệt ẩn danh khác, đăng nhập cùng tài khoản.
  2. Trên tab ẩn danh, sửa tên "Test Task 1" thành "Test Task 1 - Edited" hoặc đánh dấu "Hoàn thành".
  3. Quay lại tab trình duyệt ban đầu để quan sát.
- **Kết quả mong đợi**:
  - Tab ban đầu tự động cập nhật trạng thái/tên mới của công việc mà **không cần tải lại trang (F5)**.

---

## 3. TC03: Truy xuất dữ liệu khi F5 hoặc mở lại trình duyệt
- **Mục đích**: Chắc chắn rằng dữ liệu không bị mất sau khi tải lại trang.
- **Tiền điều kiện**: 
  - Đã có ít nhất 1 công việc hiển thị trên danh sách.
- **Các bước thực hiện**:
  1. Nhấn `F5` hoặc `Ctrl + R` để tải lại trang web.
  2. Quan sát danh sách công việc.
- **Kết quả mong đợi**:
  - Trạng thái màn hình loading xoay (Spinner) xuất hiện trong vài mili-giây.
  - Danh sách công việc được lấy về từ Firebase và hiển thị đầy đủ, chính xác như trước khi tải lại.

---

## 4. TC04: Cập nhật Streak và Daily Goals
- **Mục đích**: Xác nhận việc tick hoàn thành Thói quen hàng ngày (Daily Tasks) có cập nhật Streak lên DB.
- **Tiền điều kiện**: 
  - Có ít nhất 1 Daily Task.
- **Các bước thực hiện**:
  1. Chuyển sang trang Thói quen (`/daily`).
  2. Tick chọn hoàn thành một thói quen cho ngày hôm nay.
- **Kết quả mong đợi**:
  - Firestore ghi nhận hành động thêm ngày hoàn thành vào mảng `completedDates` của task đó.
  - Object `streak` trong document của User trên Firestore được cập nhật lại chính xác.

> [!TIP] 
> Anh có thể làm theo các bước trên để tự tay kiểm chứng lại luồng dữ liệu nha. Nếu cả 4 test case đều Pass (Thành công) thì hệ thống Data của mình đã cực kỳ vững chãi rồi đó!
