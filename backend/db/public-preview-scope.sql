-- Production only. Block mixed imports (including history-only imports).
ALTER TABLE public.subprojects ADD CONSTRAINT public_apflora_abies_only CHECK (
  project_id <> '0195a101-0000-7000-8000-000000000001' OR subproject_id = '017d3472-d75d-735d-8197-b6db29e70db3'
);
ALTER TABLE public.subprojects_history ADD CONSTRAINT public_apflora_history_abies_only CHECK (
  project_id <> '0195a101-0000-7000-8000-000000000001' OR subproject_id = '017d3472-d75d-735d-8197-b6db29e70db3'
);
