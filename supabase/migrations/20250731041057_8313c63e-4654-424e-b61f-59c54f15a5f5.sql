-- Add foreign key constraints to ensure data integrity (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_audit_categories_report_id' 
        AND table_name = 'audit_categories'
    ) THEN
        ALTER TABLE audit_categories 
        ADD CONSTRAINT fk_audit_categories_report_id 
        FOREIGN KEY (audit_report_id) REFERENCES audit_reports(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_audit_items_category_id' 
        AND table_name = 'audit_items'
    ) THEN
        ALTER TABLE audit_items 
        ADD CONSTRAINT fk_audit_items_category_id 
        FOREIGN KEY (audit_category_id) REFERENCES audit_categories(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add check constraints to ensure data validity (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_overall_score_range' 
        AND table_name = 'audit_reports'
    ) THEN
        ALTER TABLE audit_reports 
        ADD CONSTRAINT chk_overall_score_range 
        CHECK (overall_score >= 0 AND overall_score <= 100);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_item_score_range' 
        AND table_name = 'audit_items'
    ) THEN
        ALTER TABLE audit_items 
        ADD CONSTRAINT chk_item_score_range 
        CHECK (score >= 0 AND score <= 100);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_status_values' 
        AND table_name = 'audit_items'
    ) THEN
        ALTER TABLE audit_items 
        ADD CONSTRAINT chk_status_values 
        CHECK (status IN ('good', 'warning', 'poor'));
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_category_type_values' 
        AND table_name = 'audit_categories'
    ) THEN
        ALTER TABLE audit_categories 
        ADD CONSTRAINT chk_category_type_values 
        CHECK (category_type IN ('writing', 'seo', 'structure', 'technical'));
    END IF;
END $$;