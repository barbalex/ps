-- apply_operations: the single server entry point for flushed client writes.
-- The client stages local edits as a queue of operations (see
-- src/store.ts operationsQueueAtom) and flushes them here in batches, in
-- queue order — instead of one PostgREST CRUD request per operation.
--
-- One transaction for the whole batch, one savepoint per operation: a
-- failing operation reports its status and does not roll back the others,
-- preserving the semantics of the per-operation path it replaces.
--
-- Permissions are enforced by the BEFORE triggers from
-- 12_writePermissionTriggers.sql: they fire for the direct DML issued here
-- (pg_trigger_depth() is 0 inside this function). Tables without an enforce
-- trigger (child tables like check_taxa) are no less protected than they
-- were under per-row PostgREST writes — a known, pre-existing gap.
--
-- Injection safety: table names must be in the allowlist below, operation
-- kinds must be known, and every column from the payload is validated
-- against the catalog (dropping columns that do not exist or are
-- generated). All identifiers are quoted via format(%I); all values are
-- bound parameters, never spliced into SQL text.

BEGIN;

-- table names the client may write (mirrors src/modules/checkWritePermission.ts
-- and the createRows/addOperation call sites)
CREATE OR REPLACE FUNCTION apply_operations_allowed_tables()
RETURNS text[] LANGUAGE sql IMMUTABLE AS $$
  SELECT ARRAY[
    'users', 'accounts', 'messages', 'user_messages', 'widgets_for_fields',
    'crs', 'qcs', 'exports', 'field_types', 'widget_types',
    'projects', 'place_levels', 'taxonomies', 'lists', 'units', 'fields',
    'field_sorts', 'subproject_report_designs', 'project_reports',
    'project_report_designs', 'project_report_subdesigns', 'wms_services',
    'wms_layers', 'wfs_services', 'vector_layers', 'project_crs',
    'qc_assignments', 'export_assignments', 'project_exports',
    'project_export_assignments', 'project_qcs', 'project_qc_assignments',
    'project_users', 'project_roles', 'subproject_roles', 'place_roles',
    'places', 'charts', 'files',
    'taxa', 'list_values', 'wms_service_layers', 'wfs_service_layers',
    'vector_layer_geoms', 'vector_layer_displays',
    'subprojects', 'subproject_taxa', 'observation_imports', 'goals',
    'goal_reports', 'subproject_reports',
    'checks', 'check_reports', 'action_reports', 'observations', 'actions',
    'action_quantities', 'action_taxa', 'check_quantities', 'check_taxa',
    'check_report_quantities', 'action_report_quantities'
  ]
$$;

/**
 * Builds the WHERE clause for rowId / filter / filters predicates.
 * Values are not spliced into SQL: each condition references
 * ($<p_param_index> ->> '<key>')::<column type>, and the helper appends the
 * matching key/value pairs to the INOUT p_values jsonb, which the caller
 * binds as that parameter. IN filters bind jsonb arrays and use
 * jsonb_array_elements_text. Returns '' when nothing applies (parity with
 * the formerly unfiltered per-row requests).
 */
CREATE OR REPLACE FUNCTION build_apply_predicate(
  p_table text,
  p_row_id_name text,
  p_row_id text,
  p_filter jsonb,
  p_filters jsonb,
  p_param_index integer,
  INOUT p_values jsonb DEFAULT '{}'::jsonb,
  OUT p_where text
)
LANGUAGE plpgsql STABLE AS $$
DECLARE
  v_conditions text[] := '{}';
  v_conds jsonb := '[]';
  v_cond record;
  v_key_counter integer := 0;
  v_type text;
  v_key text;
BEGIN
  -- normalize the three predicate sources into one list
  IF p_row_id_name IS NOT NULL AND p_row_id IS NOT NULL THEN
    v_conds := v_conds || jsonb_build_array(jsonb_build_object(
      'col', p_row_id_name, 'op', 'eq', 'value', to_jsonb(p_row_id)));
  END IF;
  IF p_filter IS NOT NULL AND jsonb_typeof(p_filter) = 'object'
      AND p_filter->>'column' IS NOT NULL THEN
    v_conds := v_conds || jsonb_build_array(jsonb_build_object(
      'col', p_filter->>'column',
      'op', coalesce(p_filter->>'function', 'eq'),
      'value', p_filter->'value'));
  END IF;
  IF p_filters IS NOT NULL AND jsonb_typeof(p_filters) = 'array' THEN
    v_conds := v_conds || (
      SELECT coalesce(jsonb_agg(jsonb_build_object(
                'col', c->>'column',
                'op', coalesce(c->>'function', 'eq'),
                'value', c->'value')), '[]'::jsonb)
      FROM jsonb_array_elements(p_filters) AS c
      WHERE c->>'column' IS NOT NULL);
  END IF;

  FOR v_cond IN
    SELECT c->>'col' AS col, c->>'op' AS op, c->'value' AS value
    FROM jsonb_array_elements(v_conds) AS c
  LOOP
    -- validate the column against the catalog (injection guard)
    SELECT format_type(a.atttypid, a.atttypmod) INTO v_type
    FROM pg_attribute a
    WHERE a.attrelid = format('public.%I', p_table)::regclass
      AND a.attname = v_cond.col AND NOT a.attisdropped;
    IF v_type IS NULL THEN
      RAISE EXCEPTION 'apply_operations: unknown column %.%', p_table, v_cond.col
        USING ERRCODE = '42703';
    END IF;
    v_key_counter := v_key_counter + 1;
    v_key := 'p' || v_key_counter;
    IF v_cond.op = 'in' THEN
      v_conditions := v_conditions || format(
        '%I = ANY((SELECT array_agg(x) FROM jsonb_array_elements_text($%s->''%s''))::%s[])',
        v_cond.col, p_param_index, v_key, v_type);
    ELSE
      v_conditions := v_conditions || format('%I %s ($%s->>''%s'')::%s', v_cond.col,
        CASE WHEN v_cond.op = 'neq' THEN '<>' ELSE '=' END, p_param_index, v_key, v_type);
    END IF;
    p_values := p_values || jsonb_build_object(v_key, v_cond.value);
  END LOOP;

  IF cardinality(v_conditions) = 0 THEN
    p_where := '';
    RETURN;
  END IF;
  p_where := 'WHERE ' || array_to_string(v_conditions, ' AND ');
END;
$$;

CREATE OR REPLACE FUNCTION apply_operations(p_operations jsonb)
RETURNS TABLE(op_index integer, status text, detail text)
LANGUAGE plpgsql VOLATILE AS $$
DECLARE
  op jsonb;
  i integer;
  v_table text;
  v_kind text;
  v_row_id_name text;
  v_row_id text;
  v_filter jsonb;
  v_filters jsonb;
  v_draft jsonb;
  v_time timestamptz;
  v_user_id uuid;
  v_updated_by text;
  v_count integer;
  v_message text;
  v_hint text;
  -- built per operation
  v_cols text;       -- quoted, comma-separated column list (payload ∩ updatable)
  v_cols_r text;     -- same, qualified as r.<col>
  v_where text;
  v_values jsonb;
  v_row jsonb;
  v_rows jsonb;
  v_pk text;
  v_n integer;
BEGIN
  v_user_id := get_jwt_user_id();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'apply_operations: no authenticated user'
      USING ERRCODE = '28000';
  END IF;
  SELECT email INTO v_updated_by FROM users WHERE user_id = v_user_id;

  IF jsonb_typeof(p_operations) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'apply_operations: p_operations must be a jsonb array'
      USING ERRCODE = '22023';
  END IF;

  FOR i IN 0 .. jsonb_array_length(p_operations) - 1 LOOP
    op := p_operations->i;
    v_table := op->>'table';
    v_kind := op->>'operation';
    v_row_id_name := op->>'rowIdName';
    v_row_id := op->>'rowId';
    v_filter := op->'filter';
    v_filters := op->'filters';
    v_draft := op->'draft';
    v_time := coalesce((op->>'time')::timestamptz, now());

    IF v_table IS NULL OR NOT (v_table = ANY (apply_operations_allowed_tables())) THEN
      op_index := i; status := 'rejected'; detail := 'unknown table';
      RETURN NEXT; CONTINUE;
    END IF;
    IF v_kind NOT IN ('update', 'upsert', 'upsertMany', 'insert', 'insertMany', 'delete', 'deleteAll') THEN
      op_index := i; status := 'rejected'; detail := 'unknown operation';
      RETURN NEXT; CONTINUE;
    END IF;

    -- primary key column (upsert conflict target)
    SELECT a.attname INTO v_pk
    FROM pg_index x
    JOIN pg_attribute a ON a.attrelid = x.indrelid AND a.attnum = ANY (x.indkey)
    WHERE x.indrelid = format('public.%I', v_table)::regclass AND x.indisprimary
    LIMIT 1;

    -- one BEGIN...EXCEPTION block per operation: PL/pgSQL turns it into a
    -- subtransaction, so a failing operation is rolled back alone
    BEGIN
      IF v_kind IN ('insert', 'insertMany', 'upsert', 'upsertMany') THEN
        IF v_kind IN ('insertMany', 'upsertMany') THEN
          v_rows := CASE WHEN jsonb_typeof(v_draft) = 'array' THEN v_draft ELSE '[]'::jsonb END;
        ELSE
          v_rows := jsonb_build_array(
            -- rowId is merged into the row, like executeOperation does
            CASE WHEN v_row_id_name IS NOT NULL AND v_row_id IS NOT NULL
              THEN jsonb_build_object(v_row_id_name, v_row_id) ELSE '{}'::jsonb END
            || CASE WHEN jsonb_typeof(v_draft) = 'object' THEN v_draft ELSE '{}'::jsonb END
          );
        END IF;

        v_count := 0;
        FOR v_n IN 0 .. jsonb_array_length(v_rows) - 1 LOOP
          v_row := v_rows->v_n
            -- audit columns; the catalog filter below also drops them
            -- from tables lacking them (users has no updated_by)
            || jsonb_strip_nulls(jsonb_build_object(
                 'created_at', v_time,
                 'updated_at', v_time,
                 'updated_by', v_updated_by
               ));
          -- payload ∩ existing, non-generated columns (also the
          -- injection guard: unknown or generated columns are dropped)
          SELECT
            string_agg(format('%I', k), ', '),
            string_agg(format('r.%I', k), ', ')
          INTO v_cols, v_cols_r
          FROM jsonb_object_keys(v_row) AS k
          JOIN information_schema.columns c
            ON c.column_name = k
           AND c.table_schema = 'public'
           AND c.table_name = v_table
           AND c.is_generated = 'NEVER';
          IF v_cols IS NULL THEN
            RAISE EXCEPTION 'apply_operations: no valid columns for %', v_table
              USING ERRCODE = '22023';
          END IF;

          IF v_kind IN ('upsert', 'upsertMany') AND v_pk IS NOT NULL THEN
            EXECUTE format(
              'INSERT INTO public.%I (%s) SELECT %s FROM jsonb_populate_record(NULL::public.%I, $1) r'
                ' ON CONFLICT (%I) DO UPDATE SET (%s) = (SELECT %s FROM jsonb_populate_record(NULL::public.%I, $1) r)',
              v_table, v_cols, v_cols_r, v_table, v_pk, v_cols, v_cols_r, v_table)
            USING v_row;
          ELSE
            EXECUTE format(
              'INSERT INTO public.%I (%s) SELECT %s FROM jsonb_populate_record(NULL::public.%I, $1) r',
              v_table, v_cols, v_cols_r, v_table)
            USING v_row;
          END IF;
          v_count := v_count + 1;
        END LOOP;
        op_index := i; status := 'applied'; detail := v_count::text || ' rows';
        RETURN NEXT;

      ELSIF v_kind = 'update' THEN
        IF jsonb_typeof(v_draft) IS DISTINCT FROM 'object' THEN
          RAISE EXCEPTION 'apply_operations: update requires a draft object'
            USING ERRCODE = '22023';
        END IF;
        v_row := v_draft || jsonb_strip_nulls(jsonb_build_object('updated_by', v_updated_by));
        SELECT
          string_agg(format('%I', k), ', '),
          string_agg(format('r.%I', k), ', ')
        INTO v_cols, v_cols_r
        FROM jsonb_object_keys(v_row) AS k
        JOIN information_schema.columns c
          ON c.column_name = k
         AND c.table_schema = 'public'
         AND c.table_name = v_table
         AND c.is_generated = 'NEVER';
        IF v_cols IS NULL THEN
          RAISE EXCEPTION 'apply_operations: no valid columns for %', v_table
            USING ERRCODE = '22023';
        END IF;

        v_values := '{}';
        SELECT p_where, p_values INTO v_where, v_values FROM build_apply_predicate(v_table, v_row_id_name, v_row_id,
          v_filter, v_filters, 2, v_values);
        -- $1 = the row, $2 = the predicate values
        EXECUTE format(
          'UPDATE public.%I SET (%s) = (SELECT %s FROM jsonb_populate_record(NULL::public.%I, $1) r) %s',
          v_table, v_cols, v_cols_r, v_table, v_where)
        USING v_row, v_values;
        GET DIAGNOSTICS v_count = ROW_COUNT;
        IF v_count = 0 AND v_row_id_name IS NOT NULL AND v_row_id IS NOT NULL THEN
          op_index := i; status := 'no-row';
          detail := format('%s.%s=%s', v_table, v_row_id_name, v_row_id);
        ELSE
          op_index := i; status := 'applied'; detail := v_count::text || ' rows';
        END IF;
        RETURN NEXT;

      ELSIF v_kind IN ('delete', 'deleteAll') THEN
        IF v_kind = 'deleteAll' THEN
          v_where := '';
          v_values := '{}';
        ELSE
          v_values := '{}';
          SELECT p_where, p_values INTO v_where, v_values FROM build_apply_predicate(v_table, v_row_id_name, v_row_id,
            v_filter, v_filters, 1, v_values);
        END IF;
        -- $1 = the predicate values
        EXECUTE format('DELETE FROM public.%I %s', v_table, v_where)
        USING v_values;
        GET DIAGNOSTICS v_count = ROW_COUNT;
        IF v_count = 0 AND v_row_id_name IS NOT NULL AND v_row_id IS NOT NULL THEN
          op_index := i; status := 'no-row';
          detail := format('%s.%s=%s', v_table, v_row_id_name, v_row_id);
        ELSE
          op_index := i; status := 'applied'; detail := v_count::text || ' rows';
        END IF;
        RETURN NEXT;
      END IF;
    EXCEPTION
      WHEN unique_violation THEN
        op_index := i; status := 'duplicate'; detail := SQLERRM;
        RETURN NEXT;
      WHEN insufficient_privilege THEN
        GET STACKED DIAGNOSTICS v_hint = PG_EXCEPTION_HINT;
        op_index := i; status := 'permission';
        detail := concat_ws(' | ', SQLERRM, v_hint);
        RETURN NEXT;
      WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS v_hint = PG_EXCEPTION_HINT;
        op_index := i; status := 'error';
        detail := concat_ws(': ', SQLSTATE, SQLERRM, v_hint);
        RETURN NEXT;
    END;
  END LOOP;

  RETURN;
END;
$$;

-- functions in public are auto-exposed at /rpc/ by PostgREST and EXECUTE
-- defaults to PUBLIC: lock apply_operations down to authenticated calls
REVOKE EXECUTE ON FUNCTION apply_operations(jsonb) FROM PUBLIC, web_anon;
GRANT EXECUTE ON FUNCTION apply_operations(jsonb) TO app_user;
REVOKE EXECUTE ON FUNCTION apply_operations_allowed_tables() FROM PUBLIC, web_anon;
GRANT EXECUTE ON FUNCTION apply_operations_allowed_tables() TO app_user;
-- identity signature: OUT parameters are not part of it
REVOKE EXECUTE ON FUNCTION build_apply_predicate(text, text, text, jsonb, jsonb, integer, jsonb) FROM PUBLIC, web_anon;
GRANT EXECUTE ON FUNCTION build_apply_predicate(text, text, text, jsonb, jsonb, integer, jsonb) TO app_user;

COMMIT;
