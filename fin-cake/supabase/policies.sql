-- Step 6: Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

-- Step 7: Create basic policies (skip RLS for now to test)
-- We'll add these later once basic functionality works

-- For now, allow all operations (we'll secure later)
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on portfolios" ON portfolios FOR ALL USING (true);
CREATE POLICY "Allow all operations on news" ON news FOR ALL USING (true);
CREATE POLICY "Allow all operations on chat_logs" ON chat_logs FOR ALL USING (true);
