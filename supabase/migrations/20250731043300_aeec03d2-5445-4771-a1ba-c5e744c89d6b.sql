-- Add missing foreign key constraints to establish proper relationships

-- Add foreign key constraint from audit_categories to audit_reports
ALTER TABLE audit_categories
ADD CONSTRAINT audit_categories_audit_report_id_fkey 
FOREIGN KEY (audit_report_id) REFERENCES audit_reports(id) ON DELETE CASCADE;

-- Add foreign key constraint from audit_items to audit_categories  
ALTER TABLE audit_items
ADD CONSTRAINT audit_items_audit_category_id_fkey 
FOREIGN KEY (audit_category_id) REFERENCES audit_categories(id) ON DELETE CASCADE;

-- Update the update_updated_at_column trigger for audit_reports
CREATE TRIGGER update_audit_reports_updated_at
    BEFORE UPDATE ON audit_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();