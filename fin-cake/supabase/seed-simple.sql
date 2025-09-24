-- Step 8: Insert sample news data
INSERT INTO news (symbol, title, summary, source_url, source, published_at) VALUES
('HPG', 'Hoa Phat Group cong bo ket qua kinh doanh Q4/2024', 'Cong ty Hoa Phat Group (HPG) vua cong bo ket qua kinh doanh quy 4/2024 voi doanh thu tang 15% so voi cung ky nam truoc.', 'https://cafef.vn/hoa-phat-group-cong-bo-ket-qua-kinh-doanh-q4-2024.html', 'CafeF', NOW() - INTERVAL '2 hours'),
('VNM', 'Vinamilk tang cuong dau tu vao thi truong xuat khau', 'Vinamilk (VNM) dang co ke hoach mo rong thi truong xuat khau sang cac nuoc Dong Nam A va Trung Dong.', 'https://vnexpress.net/vinamilk-tang-cuong-dau-tu-vao-thi-truong-xuat-khau.html', 'VNExpress', NOW() - INTERVAL '4 hours'),
('VCB', 'Vietcombank cong bo lai suat tien gui moi', 'Ngan hang TMCP Ngoai Thuong Viet Nam (VCB) vua dieu chinh lai suat tien gui ky han 12 thang len 7.5%/nam.', 'https://cafef.vn/vietcombank-cong-bo-lai-suat-tien-gui-moi.html', 'CafeF', NOW() - INTERVAL '6 hours');
