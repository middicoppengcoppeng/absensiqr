-- Create settings table
CREATE TABLE public.settings (
  id TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Allow all actions for authenticated users
CREATE POLICY "Allow all actions for authenticated users" ON public.settings FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow read for public" ON public.settings FOR SELECT USING (true);

-- Insert default settings
INSERT INTO public.settings (id, value) VALUES ('school_name', 'SD Negeri 1');
INSERT INTO public.settings (id, value) VALUES ('academic_year', '2025/2026');
