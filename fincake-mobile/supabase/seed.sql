-- FinCake Mobile App Seed Data
-- Sample news clusters and articles for testing

-- Clear existing data
DELETE FROM news;
DELETE FROM news_clusters;

-- Insert sample news clusters
INSERT INTO news_clusters (id, topic, summary, created_at) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'Cổ phiếu ngân hàng tăng mạnh',
    'Các cổ phiếu ngân hàng lớn như VCB, BID, CTG đều tăng mạnh trong phiên giao dịch hôm nay, được hỗ trợ bởi kết quả kinh doanh tích cực và triển vọng tăng trưởng tín dụng.',
    NOW() - INTERVAL '2 hours'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    'Thị trường bất động sản phục hồi',
    'Thị trường bất động sản Việt Nam cho thấy dấu hiệu phục hồi với việc tăng giá nhà đất và giao dịch mua bán sôi động tại các thành phố lớn.',
    NOW() - INTERVAL '4 hours'
  );

-- Insert sample news articles for cluster 1 (Banking)
INSERT INTO news (id, cluster_id, title, summary, source_url, source, published_at) VALUES
  (
    '660e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'VCB tăng 3.2% sau báo cáo lợi nhuận Q3 vượt kỳ vọng',
    'Vietcombank (VCB) ghi nhận lợi nhuận quý 3 đạt 8.2 nghìn tỷ đồng, tăng 15% so với cùng kỳ năm trước, vượt kỳ vọng của các nhà phân tích.',
    'https://example.com/vcb-q3-profit',
    'CafeF',
    NOW() - INTERVAL '1 hour'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440001',
    'BID công bố kế hoạch mở rộng mạng lưới chi nhánh',
    'Ngân hàng Đầu tư và Phát triển Việt Nam (BID) dự kiến mở thêm 50 chi nhánh mới trong năm 2024 để phục vụ nhu cầu tín dụng ngày càng tăng.',
    'https://example.com/bid-expansion',
    'VNExpress',
    NOW() - INTERVAL '2 hours'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440001',
    'CTG tăng trưởng tín dụng 12% trong 9 tháng đầu năm',
    'VietinBank (CTG) báo cáo tăng trưởng tín dụng đạt 12% trong 9 tháng đầu năm 2024, tập trung vào các lĩnh vực sản xuất và xuất khẩu.',
    'https://example.com/ctg-credit-growth',
    'CafeF',
    NOW() - INTERVAL '3 hours'
  );

-- Insert sample news articles for cluster 2 (Real Estate)
INSERT INTO news (id, cluster_id, title, summary, source_url, source, published_at) VALUES
  (
    '660e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440002',
    'Giá nhà đất Hà Nội tăng 8% trong quý 3',
    'Theo báo cáo của Hiệp hội Bất động sản Hà Nội, giá nhà đất tại thủ đô tăng trung bình 8% trong quý 3/2024 so với quý trước.',
    'https://example.com/hanoi-real-estate-q3',
    'VNExpress',
    NOW() - INTERVAL '2 hours'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440002',
    'TP.HCM ghi nhận 15.000 giao dịch nhà đất trong tháng 9',
    'Sở Xây dựng TP.HCM báo cáo có 15.000 giao dịch nhà đất được thực hiện trong tháng 9, tăng 25% so với tháng 8.',
    'https://example.com/hcmc-real-estate-sep',
    'CafeF',
    NOW() - INTERVAL '3 hours'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440006',
    '550e8400-e29b-41d4-a716-446655440002',
    'Dự án khu đô thị mới tại Đà Nẵng thu hút 2.000 khách hàng',
    'Dự án khu đô thị mới tại Đà Nẵng với tổng vốn đầu tư 5.000 tỷ đồng đã thu hút hơn 2.000 khách hàng đăng ký mua nhà trong tuần đầu ra mắt.',
    'https://example.com/danang-new-urban',
    'VNExpress',
    NOW() - INTERVAL '4 hours'
  );
