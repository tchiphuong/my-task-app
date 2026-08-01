/**
 * Hàm chuyển đổi tiếng Việt có dấu thành không dấu để hỗ trợ tìm kiếm hoặc xuất file (như PDF) không bị lỗi font.
 */
export const removeVietnameseTones = (str: string): string => {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replaceAll("đ", "d")
        .replaceAll("Đ", "D");
};
