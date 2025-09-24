-- Step 6: Enable Row Level Security (safe version)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

-- Step 7: Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Allow all operations on users" ON users;
DROP POLICY IF EXISTS "Allow all operations on portfolios" ON portfolios;
DROP POLICY IF EXISTS "Allow all operations on news" ON news;
DROP POLICY IF EXISTS "Allow all operations on chat_logs" ON chat_logs;

-- Create new policies
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on portfolios" ON portfolios FOR ALL USING (true);
CREATE POLICY "Allow all operations on news" ON news FOR ALL USING (true);
CREATE POLICY "Allow all operations on chat_logs" ON chat_logs FOR ALL USING (true);
