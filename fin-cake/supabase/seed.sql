-- FinCake Seed Data
-- Run after schema.sql

-- Insert sample news data
INSERT INTO news (symbol, title, summary, source_url, source, published_at) VALUES
(
    'HPG',
    'Hòa Phát Group công bố kết quả kinh doanh Q4/2024',
    'Công ty Hòa Phát Group (HPG) vừa công bố kết quả kinh doanh quý 4/2024 với doanh thu tăng 15% so với cùng kỳ năm trước. Lợi nhuận sau thuế đạt 2.500 tỷ đồng, tăng 20% so với quý 3/2024.',
    'https://cafef.vn/hoa-phat-group-cong-bo-ket-qua-kinh-doanh-q4-2024.html',
    'CafeF',
    NOW() - INTERVAL '2 hours'
),
(
    'VNM',
    'Vinamilk tăng cường đầu tư vào thị trường xuất khẩu',
    'Vinamilk (VNM) đang có kế hoạch mở rộng thị trường xuất khẩu sang các nước Đông Nam Á và Trung Đông. Dự kiến doanh thu xuất khẩu sẽ tăng 25% trong năm 2025.',
    'https://vnexpress.net/vinamilk-tang-cuong-dau-tu-vao-thi-truong-xuat-khau.html',
    'VNExpress',
    NOW() - INTERVAL '4 hours'
),
(
    'VCB',
    'Vietcombank công bố lãi suất tiền gửi mới',
    'Ngân hàng TMCP Ngoại Thương Việt Nam (VCB) vừa điều chỉnh lãi suất tiền gửi kỳ hạn 12 tháng lên 7.5%/năm, áp dụng từ ngày 1/1/2025.',
    'https://cafef.vn/vietcombank-cong-bo-lai-suat-tien-gui-moi.html',
    'CafeF',
    NOW() - INTERVAL '6 hours'
),
(
    'MSN',
    'Masan Group đầu tư 1.000 tỷ vào ngành chăn nuôi',
    'Tập đoàn Masan (MSN) vừa công bố kế hoạch đầu tư 1.000 tỷ đồng vào ngành chăn nuôi và chế biến thực phẩm, dự kiến hoàn thành trong 2 năm tới.',
    'https://vnexpress.net/masan-group-dau-tu-1000-ty-vao-nganh-chan-nuoi.html',
    'VNExpress',
    NOW() - INTERVAL '8 hours'
),
(
    'FPT',
    'FPT Corporation ký hợp đồng với khách hàng Nhật Bản',
    'FPT Corporation (FPT) vừa ký hợp đồng cung cấp dịch vụ công nghệ thông tin trị giá 50 triệu USD với một tập đoàn lớn tại Nhật Bản.',
    'https://cafef.vn/fpt-corporation-ky-hop-dong-voi-khach-hang-nhat-ban.html',
    'CafeF',
    NOW() - INTERVAL '10 hours'
);

