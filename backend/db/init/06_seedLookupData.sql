BEGIN;
--------------------------------------------------------------
-- Reference Data Seeds
-- This file contains INSERT statements for reference/lookup tables
-- that should be synced to the frontend via Electric
--------------------------------------------------------------

-- chart_subject_types
insert into chart_subject_types ("type", sort, updated_by) values ('linear', 1, 'admin'), ('monotone', 2, 'admin')
on conflict ("type") do nothing;

COMMIT;
