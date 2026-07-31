# Kịch bản kiểm thử (Test Cases) - Trang "Mỗi ngày" (/daily)

Dưới đây là các test case chi tiết dành cho tính năng **Thói quen mỗi ngày (Daily Habits)**. Các case này bao phủ từ giao diện (UI) cho đến logic tính toán chuỗi kỷ luật (Streak) và thanh tiến độ.

## 1. Thêm Thói Quen Mới (Add Daily Habit)

| ID | Tên Kịch Bản (Test Case) | Các bước thực hiện (Steps) | Kết quả mong đợi (Expected Result) |
| :--- | :--- | :--- | :--- |
| **TC-01** | Thêm thói quen thành công | 1. Nhập "Tập gym 30p" vào ô "Tên thói quen".<br>2. Chọn danh mục "Sức khỏe".<br>3. Bấm nút "Thêm vào thói quen ngày". | - Form bị xóa trống (reset).<br>- Thói quen "Tập gym 30p" xuất hiện bên danh sách bên phải.<br>- Thanh tiến độ tổng tự động tính toán lại. |
| **TC-02** | Khóa nút "Thêm" khi bỏ trống | 1. Xóa trắng ô "Tên thói quen" (hoặc chỉ gõ space). | - Nút "Thêm vào thói quen ngày" bị mờ đi (disabled) và không thể bấm được. |
| **TC-03** | Chuyển đổi danh mục (Category) | 1. Bấm chọn các danh mục khác nhau (Công việc, Học tập...). | - Danh mục được chọn sáng lên (Màu primary/accent).<br>- Các danh mục khác trở về dạng mờ (soft/default). |

## 2. Thao Tác Với Danh Sách Thói Quen (Habit List)

| ID | Tên Kịch Bản (Test Case) | Các bước thực hiện (Steps) | Kết quả mong đợi (Expected Result) |
| :--- | :--- | :--- | :--- |
| **TC-04** | Hiển thị màn hình trống (Empty state) | 1. Đăng nhập tài khoản mới chưa có thói quen nào.<br>2. Truy cập trang `/daily`. | - Hiển thị dòng chữ "Bắt đầu thói quen tốt!" cùng với icon lấp lánh (SparklesIcon). |
| **TC-05** | Check hoàn thành thói quen (Mark done) | 1. Bấm vào nút hình tròn bên trái tên thói quen. | - Nút chuyển sang màu xanh (success) có dấu tick.<br>- Tên thói quen bị gạch ngang và mờ đi.<br>- Bảng "Đã tích" tăng lên 1 lần. |
| **TC-06** | Uncheck thói quen (Undo mark done) | 1. Bấm vào thói quen đã hoàn thành. | - Dấu tick mất đi, nút trở về viền xám.<br>- Tên thói quen hiện lại bình thường (không bị gạch ngang). |
| **TC-07** | Xóa thói quen (Delete habit) | 1. Bấm vào icon "Thùng rác" màu đỏ ở góc phải thói quen. | - Thói quen biến mất khỏi danh sách.<br>- Các chỉ số (Thanh tiến độ) tự động cập nhật lại theo số lượng mới. |

## 3. Cập Nhật Tiến Độ & Thống Kê (Progress & Stats)

| ID | Tên Kịch Bản (Test Case) | Các bước thực hiện (Steps) | Kết quả mong đợi (Expected Result) |
| :--- | :--- | :--- | :--- |
| **TC-08** | Cập nhật thanh tiến độ (Progress Bar) | 1. Tạo 2 thói quen mới.<br>2. Tích hoàn thành 1 thói quen. | - Thẻ "Tiến độ hôm nay" hiện 50%.<br>- Dòng chữ hiện "(Đã xong 1/2 thói quen)".<br>- Thanh ProgressBar chạy tới một nửa. |
| **TC-09** | Hoàn thành 100% mục tiêu ngày | 1. Tích hoàn thành toàn bộ thói quen đang có. | - Tiến độ hiển thị 100%.<br>- Dòng chữ italic hiện: "Thật tuyệt vời! Anh đã hoàn thành toàn bộ thói quen hôm nay." |

## 4. Chuỗi Kỷ Luật & Lịch Sử (Streak & History)

| ID | Tên Kịch Bản (Test Case) | Các bước thực hiện (Steps) | Kết quả mong đợi (Expected Result) |
| :--- | :--- | :--- | :--- |
| **TC-10** | Tính toán Kỷ luật liên tục (Current Streak) | 1. Giả lập tích hoàn thành 100% thói quen của ngày hôm qua và ngày hôm nay. | - Thẻ "Kỷ luật liên tục" hiện "2 ngày". |
| **TC-11** | Tính Kỷ lục tốt nhất (Best Streak) | 1. Hoàn thành liên tục 5 ngày, ngắt quãng, rồi hoàn thành 2 ngày. | - "Kỷ lục tốt nhất của anh" hiển thị "5 ngày". |
| **TC-12** | Lịch sử 7 ngày: Chưa hoàn thành | 1. Nhìn vào thẻ "Nhìn lại 7 ngày qua".<br>2. Chọn 1 ngày không tích đủ thói quen. | - Hiển thị phân số (vd: 1/3) dưới ô ngày.<br>- Ô ngày có nền màu vàng nhạt (warning). |
| **TC-13** | Lịch sử 7 ngày: Đã hoàn thành 100% | 1. Nhìn vào thẻ "Nhìn lại 7 ngày qua".<br>2. Chọn 1 ngày đã tích đủ 100%. | - Ô ngày chuyển thành màu xanh lá cây (success) với dấu tick check.<br>- Không hiện số phân số (vd: 3/3 sẽ biến thành dấu tick). |
