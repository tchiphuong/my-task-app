# Kịch bản kiểm thử (Test Cases): Màn hình Quản lý Công việc (Tasks Page)

Tài liệu này bao gồm các kịch bản kiểm thử thủ công để đảm bảo tính năng quản lý công việc trên trang `/tasks` hoạt động ổn định và chính xác.

---

## 1. TC01: Tạo mới công việc thành công
- **Mục đích**: Đảm bảo chức năng thêm công việc mới hoạt động đúng.
- **Các bước thực hiện**:
  1. Nhấn nút **"Thêm việc"**.
  2. Điền Tiêu đề (Bắt buộc), Mô tả, chọn Độ ưu tiên, Hạn chót và Danh mục.
  3. Nhấn **"Tạo công việc"**.
- **Kết quả mong đợi**:
  - Popup đóng lại.
  - Công việc mới xuất hiện ở cột "Cần làm" (Todo) hoặc Tab "Cần làm".
  - Hiển thị thông báo (Toast) thành công.

## 2. TC02: Chỉnh sửa công việc (Edit Task)
- **Mục đích**: Xác nhận tính năng cập nhật thông tin công việc hiện có.
- **Các bước thực hiện**:
  1. Tìm một công việc đang có trên danh sách.
  2. Nhấn biểu tượng 3 chấm (Dropdown) -> Chọn **"Chỉnh sửa"**.
  3. Đổi tên tiêu đề thành tên mới và thay đổi "Độ ưu tiên".
  4. Nhấn **"Lưu thay đổi"**.
- **Kết quả mong đợi**:
  - Tên và độ ưu tiên của thẻ công việc đó được cập nhật lập tức trên màn hình.

## 3. TC03: Kéo/Chuyển trạng thái công việc
- **Mục đích**: Đảm bảo luồng trạng thái (Todo -> In Progress -> Done) hoạt động đúng.
- **Các bước thực hiện**:
  1. Ở một công việc thuộc nhóm "Cần làm", nhấn nút (Play) hoặc Menu -> **"Bắt đầu làm"**.
  2. Chờ công việc chuyển sang trạng thái "Đang làm".
  3. Ở công việc đó, nhấn nút (Check) hoặc Menu -> **"Hoàn thành"**.
- **Kết quả mong đợi**:
  - Số lượng hiển thị trên các cột (hoặc Tab) cập nhật đúng (cộng/trừ 1).
  - Khi hoàn thành, chữ bị gạch ngang và mất màu nổi bật.

## 4. TC04: Tính năng Lọc (Filter & Search)
- **Mục đích**: Xác nhận thanh tìm kiếm và bộ lọc hoạt động mượt mà.
- **Các bước thực hiện**:
  1. Nhập một từ khóa có trong tên công việc vào thanh tìm kiếm. (Ví dụ: "Học tập").
  2. Xóa trắng thanh tìm kiếm.
  3. Bấm Chọn bộ lọc "Danh mục" -> Chọn một danh mục có sẵn.
  4. Bấm Chọn bộ lọc "Độ ưu tiên" -> Chọn "Cao".
- **Kết quả mong đợi**:
  - Giao diện lập tức chỉ giữ lại những công việc khớp với điều kiện lọc mà không bị giật lag.

## 5. TC05: Xóa công việc
- **Mục đích**: Đảm bảo tính năng xóa công việc và cập nhật danh sách.
- **Các bước thực hiện**:
  1. Bấm Menu 3 chấm ở một công việc bất kỳ -> Chọn **"Xóa công việc"**.
- **Kết quả mong đợi**:
  - Công việc biến mất khỏi danh sách.
  - Tổng số lượng công việc giảm đi 1.
