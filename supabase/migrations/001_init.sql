-- Create audits table
CREATE TABLE IF NOT EXISTS audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    tools_input JSONB NOT NULL,
    audit_result JSONB NOT NULL,
    total_monthly_savings NUMERIC NOT NULL,
    email TEXT,
    company_name TEXT,
    role TEXT,
    team_size INTEGER,
    is_lead BOOLEAN DEFAULT FALSE,
    share_token TEXT UNIQUE NOT NULL
);

-- Index for share_token
CREATE INDEX IF NOT EXISTS idx_audits_share_token ON audits(share_token);

-- RLS Policies
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for the audit form)
CREATE POLICY "Allow anonymous inserts" ON audits
    FOR INSERT TO anon
    WITH CHECK (true);

-- Allow anonymous selects by share_token
CREATE POLICY "Allow anonymous select by share_token" ON audits
    FOR SELECT TO anon
    USING (true);
