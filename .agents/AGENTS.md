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
- **Không tự chế class cho HeroUI Components**: TUYỆT ĐỐI không tự ý nhét các class Tailwind (như `bg-...`, `border-...`, `rounded-...`, `w-...`, `h-...`, `min-w-...`, `p-...`) vào bất kỳ component nào của `@heroui/react` (chẳng hạn như `Button`, `Input`, `Select`, `TextField`, `TextArea`, `Card`...) để đè style mặc định của HeroUI. Nếu cần chỉnh style, bắt buộc phải dùng prop chuẩn của thư viện (như `variant`, `color`, `radius`, `size`, `isIconOnly`...) hoặc bọc đúng cấu trúc component theo mẫu bên UniManage. Quy tắc này áp dụng cho TẤT CẢ các component của HeroUI, không chỉ riêng form control.
- **Quy tắc phân lớp giao diện (Visual Layering Rule)**: Khi phần tử cha (parent container/card) có nền màu primary/primary glass (ví dụ: các Form Modal), thì các phần tử con nhập liệu bên trong (children như Input, Select, TextArea, DatePicker...) bắt buộc phải sử dụng `variant="secondary"` để tạo độ tương phản và phân tách thị giác rõ ràng. Quy tắc này áp dụng tương tự cho các cấp con nhỏ hơn (ví dụ: con của secondary sẽ dùng style nhỏ hơn như default/flat/tertiary).

## 3. Best Practices & Code Structure

- **KHÔNG HARDCODE CHUỖI HIỂN THỊ & SORT KEY I18N A-Z**: Tuyệt đối không viết cứng bất kỳ chuỗi text tiếng Việt hay tiếng Anh nào trong code UI. Tất cả các chuỗi hiển thị, nhãn, thông tin thông báo, thời gian (ví dụ: "vài phút trước", "ngày trước"), hay tiêu đề cột khi xuất file (Excel, PDF) đều bắt buộc phải được đưa vào file i18n duy nhất ([common.json](../src/i18n/locales/vi/common.json)) và gọi thông qua hàm `t()`. ĐẶC BIỆT, tất cả các key trong file i18n này bắt buộc phải được sắp xếp theo thứ tự bảng chữ cái A-Z (đệ quy từ trên xuống dưới) để dễ quản lý và tránh trùng lặp.
- **KHÔNG HARDCODE CHUỖI CẤU HÌNH, ĐỊNH DẠNG**: Tuyệt đối không viết cứng các chuỗi định dạng ngày tháng (như `"yyyy-MM-dd"`, `"EE"`), các trạng thái (như `"todo"`, `"done"`, `"overdue"`), hay các mức độ ưu tiên trực tiếp trong code. Tất cả các chuỗi cấu hình này bắt buộc phải được gom nhóm thành hằng số (constants) tại [constants/index.ts](../src/constants/index.ts) và import vào sử dụng để đảm bảo tính đồng bộ.
- **Cấu hình i18n duy nhất tiếng Việt (vi)**: Dự án chỉ tập trung hỗ trợ duy nhất ngôn ngữ tiếng Việt. Không tạo thêm các folder ngôn ngữ khác (như `en`, `ja`) để tránh phức tạp và dư thừa file cấu hình.
- **Trải nghiệm dạng App di động**: Các thành phần điều hướng trên mobile (như thanh Navbar dưới cùng) phải mang lại cảm giác mượt mà, tức thời như một ứng dụng Native App thực thụ (không chuyển trang/load lại toàn bộ trang web).
- **Giữ Code Gọn Gàng**: Xóa bỏ các đoạn code dư thừa, không để các thành phần UI trùng lặp gây rối mắt (ví dụ: profile avatar chỉ nên xuất hiện 1 chỗ thay vì cả Header lẫn Sidebar).
- **Giao tiếp với Dev**: Luôn comment code và trò chuyện với anh (người đang ra lệnh) bằng Tiếng Việt phong cách chuẩn miền Nam, xưng "em" gọi "anh".
- **Văn phong UI (End-user Tone)**: BẮT BUỘC dùng ngôn từ chuyên nghiệp, lịch sự và trung lập về giới tính (dùng "Bạn", KHÔNG dùng "Anh/Chị/anh ơi") cho các đoạn text hiển thị trên giao diện app. Không dùng văn phong suồng sã hay thuật ngữ kỹ thuật (như "keys", ".env") để báo lỗi cho người dùng cuối.
- **Data Mẫu & Fallback (Mock Data)**: Tuyệt đối không để lọt các tính năng "Demo", thông tin tài khoản giả, hoặc hình ảnh placeholder (như Unsplash) cứng ngắc trên code thực tế. Phải dùng UI chuẩn để xử lý trường hợp không có dữ liệu (ví dụ: dùng Avatar Fallback chữ cái đầu thay vì hình giả).
