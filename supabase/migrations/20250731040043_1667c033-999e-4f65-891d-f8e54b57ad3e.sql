-- Add unique constraint to prevent duplicate audit reports for the same URL within 24 hours
-- This will prevent race conditions and ensure data integrity

-- Add unique index on url and created_at (by date) to prevent duplicates within same day
CREATE UNIQUE INDEX idx_audit_reports_url_date 
ON audit_reports (url, DATE(created_at));

-- Add foreign key constraints to ensure data integrity
ALTER TABLE audit_categories 
ADD CONSTRAINT fk_audit_categories_report_id 
FOREIGN KEY (audit_report_id) REFERENCES audit_reports(id) ON DELETE CASCADE;

ALTER TABLE audit_items 
ADD CONSTRAINT fk_audit_items_category_id 
FOREIGN KEY (audit_category_id) REFERENCES audit_categories(id) ON DELETE CASCADE;

-- Add check constraints to ensure data validity
ALTER TABLE audit_reports 
ADD CONSTRAINT chk_overall_score_range 
CHECK (overall_score >= 0 AND overall_score <= 100);

ALTER TABLE audit_items 
ADD CONSTRAINT chk_item_score_range 
CHECK (score >= 0 AND score <= 100);

ALTER TABLE audit_items 
ADD CONSTRAINT chk_status_values 
CHECK (status IN ('good', 'warning', 'poor'));

ALTER TABLE audit_categories 
ADD CONSTRAINT chk_category_type_values 
CHECK (category_type IN ('writing', 'seo', 'structure', 'technical'));