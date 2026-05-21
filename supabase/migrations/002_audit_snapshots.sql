-- Create audit_snapshots table
CREATE TABLE IF NOT EXISTS audit_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID REFERENCES audits(id) ON DELETE CASCADE,
  user_email TEXT,
  tools_input JSONB NOT NULL,
  audit_result JSONB NOT NULL,
  pricing_snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notified_at TIMESTAMPTZ,
  is_stale BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_audit_snapshots_email ON audit_snapshots(user_email);
CREATE INDEX IF NOT EXISTS idx_audit_snapshots_stale ON audit_snapshots(is_stale) WHERE is_stale = true;

-- Create pricing_changes table
CREATE TABLE IF NOT EXISTS pricing_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_name TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  old_price NUMERIC NOT NULL,
  new_price NUMERIC NOT NULL,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  affected_audits_count INTEGER DEFAULT 0
);

-- RLS Policies
ALTER TABLE audit_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_changes ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts to audit_snapshots for initial creation
CREATE POLICY "Allow anonymous inserts on audit_snapshots" ON audit_snapshots
    FOR INSERT TO anon
    WITH CHECK (true);

-- Allow service role full access (default, but explicit just in case)
CREATE POLICY "Allow service role full access to audit_snapshots" ON audit_snapshots
    FOR ALL USING (true);
    
CREATE POLICY "Allow service role full access to pricing_changes" ON pricing_changes
    FOR ALL USING (true);
