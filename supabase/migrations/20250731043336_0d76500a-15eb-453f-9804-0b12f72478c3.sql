-- Add missing foreign key constraint from audit_items to audit_categories (only if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'audit_items_audit_category_id_fkey' 
        AND table_name = 'audit_items'
    ) THEN
        ALTER TABLE audit_items
        ADD CONSTRAINT audit_items_audit_category_id_fkey 
        FOREIGN KEY (audit_category_id) REFERENCES audit_categories(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add trigger for audit_reports updated_at (only if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_audit_reports_updated_at'
        AND event_object_table = 'audit_reports'
    ) THEN
        CREATE TRIGGER update_audit_reports_updated_at
            BEFORE UPDATE ON audit_reports
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;