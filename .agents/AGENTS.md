# My Task App - AI Agent Coding Rules

## 1. Tailwind CSS Standards

- **KHÔNG dùng Arbitrary Values**: Tuyệt đối KHÔNG sử dụng các giá trị cứng tự chế chèn thẳng vào class (ví dụ: `text-[10px]`, `text-[9px]`, `w-[15px]`, `h-[30px]`). Bắt buộc phải sử dụng các class tiện ích (utility classes) tiêu chuẩn mặc định của Tailwind (như `text-xs`, `text-sm`, `w-4`, `h-8`).
- **Spacing & Layout**: Luôn bám sát hệ thống spacing và grid của Tailwind.

## 2. UI/UX & Aesthetics (Giao diện)

- **Tận dụng HeroUI**: BẮT BUỘC ưu tiên sử dụng tối đa các component có sẵn của `@heroui/react` (như `<Dropdown>`, `<DropdownTrigger>`, `<Card>`, `<Avatar>`, `<Chip>`, `<User>`) thay vì tự code thủ công bằng thẻ `div` để đảm bảo chuẩn UI và không lỗi vặt. Đọc kỹ API hoặc code hiện có để import đúng.
- **Màu sắc & Sinh động**: Giao diện không được làm kiểu trắng đen nhàm chán (monochromatic). Phải sử dụng màu sắc theo ngữ cảnh (`primary`, `success`, `warning`, `danger`) để làm nổi bật thông tin.
- **Hiệu ứng & Glassmorphism**: Thêm `backdrop-blur-md`, bóng đổ mềm (`shadow-sm`, `hover:shadow-md`), và các hiệu ứng chuyển đổi mượt mà (`transition-all duration-300 hover:-translate-y-1`) để tạo cảm giác xịn xò.
- **Bong bóng trang trí (Decorative Bubbles)**: Áp dụng các khối tròn mờ mờ ở góc các thẻ (`absolute -top-4 -right-4 h-24 w-24 rounded-full opacity-10 bg-color pointer-events-none`) để tạo điểm nhấn hiện đại. CHÚ Ý: Không để nhiều lớp background đè lên nhau (ví dụ thẻ có bg màu rồi thì icon bên trong nên hạn chế bọc thêm bg màu nữa).
- **Tham khảo UniManage**: KHI code UI (đặc biệt là form controls, inputs, modals...), BẮT BUỘC phải tham khảo source code mẫu ở `D:\Coding\dot_NET\UniManage\frontend\uni-manage\components\common\` để bắt chước cấu trúc component.
- **Không tự chế class form control**: TUYỆT ĐỐI không tự ý nhét các class Tailwind (như `bg-...`, `border-...`) vào các thẻ control (`Input`, `Select`, `TextField`, `TextArea`...) để đè style mặc định của HeroUI. Nếu cần chỉnh style, dùng prop chuẩn như `variant` hoặc bọc đúng cấu trúc component theo mẫu bên UniManage.

## 3. Best Practices & Code Structure

- **Giữ Code Gọn Gàng**: Xóa bỏ các đoạn code dư thừa, không để các thành phần UI trùng lặp gây rối mắt (ví dụ: profile avatar chỉ nên xuất hiện 1 chỗ thay vì cả Header lẫn Sidebar).
- **Giao tiếp với Dev**: Luôn comment code và trò chuyện với anh (người đang ra lệnh) bằng Tiếng Việt phong cách chuẩn miền Nam, xưng "em" gọi "anh".
- **Văn phong UI (End-user Tone)**: BẮT BUỘC dùng ngôn từ chuyên nghiệp, lịch sự và trung lập về giới tính (dùng "Bạn", KHÔNG dùng "Anh/Chị/anh ơi") cho các đoạn text hiển thị trên giao diện app. Không dùng văn phong suồng sã hay thuật ngữ kỹ thuật (như "keys", ".env") để báo lỗi cho người dùng cuối.
- **Data Mẫu & Fallback (Mock Data)**: Tuyệt đối không để lọt các tính năng "Demo", thông tin tài khoản giả, hoặc hình ảnh placeholder (như Unsplash) cứng ngắc trên code thực tế. Phải dùng UI chuẩn để xử lý trường hợp không có dữ liệu (ví dụ: dùng Avatar Fallback chữ cái đầu thay vì hình giả).
