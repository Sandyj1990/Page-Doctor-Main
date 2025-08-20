-- Create audit_reports table to store website audit results
CREATE TABLE public.audit_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  overall_score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit_categories table to store different audit categories
CREATE TABLE public.audit_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_report_id UUID NOT NULL REFERENCES public.audit_reports(id) ON DELETE CASCADE,
  category_type TEXT NOT NULL, -- 'writing', 'seo', 'structure', 'technical'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit_items table to store individual audit items within categories
CREATE TABLE public.audit_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_category_id UUID NOT NULL REFERENCES public.audit_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  score INTEGER NOT NULL,
  status TEXT NOT NULL, -- 'good', 'warning', 'poor'
  description TEXT NOT NULL,
  details JSONB, -- Store array of detail strings
  stats JSONB, -- Store stats object with found, total, examples
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.audit_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a public audit tool)
CREATE POLICY "Audit reports are viewable by everyone" 
ON public.audit_reports 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create audit reports" 
ON public.audit_reports 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Audit categories are viewable by everyone" 
ON public.audit_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create audit categories" 
ON public.audit_categories 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Audit items are viewable by everyone" 
ON public.audit_items 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create audit items" 
ON public.audit_items 
FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_audit_reports_updated_at
BEFORE UPDATE ON public.audit_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_audit_reports_url ON public.audit_reports(url);
CREATE INDEX idx_audit_categories_report_id ON public.audit_categories(audit_report_id);
CREATE INDEX idx_audit_categories_type ON public.audit_categories(category_type);
CREATE INDEX idx_audit_items_category_id ON public.audit_items(audit_category_id);