CREATE TABLE files(
  file_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  subproject_id uuid DEFAULT NULL REFERENCES subprojects(subproject_id) ON DELETE CASCADE ON UPDATE CASCADE,
  place_id uuid DEFAULT NULL REFERENCES places(place_id) ON DELETE CASCADE ON UPDATE CASCADE,
  action_id uuid DEFAULT NULL REFERENCES actions(action_id) ON DELETE CASCADE ON UPDATE CASCADE,
  check_id uuid DEFAULT NULL REFERENCES checks(check_id) ON DELETE CASCADE ON UPDATE CASCADE,
  name text DEFAULT NULL, -- file-upload-success-event.detail.name
  size bigint DEFAULT NULL, -- file-upload-success-event.detail.size
  label_replace_by_generated_column text DEFAULT NULL,
  data jsonb DEFAULT NULL, -- TODO: not defineable in fields table!!
  mimetype text DEFAULT NULL, -- file-upload-success-event.detail.mimeType
  -- need width and height to get the aspect ratio of the image
  width integer DEFAULT NULL, -- file-upload-success-event.detail.fileInfo.image.width
  height integer DEFAULT NULL, -- file-upload-success-event.detail.fileInfo.image.height
  -- file bytea DEFAULT NULL, -- TODO: not yet supported by electric-sql
  -- preview bytea DEFAULT NULL, -- TODO: not yet supported by electric-sql
  url text DEFAULT NULL, -- file-upload-success-event.detail.cdnUrl
  uuid uuid DEFAULT NULL, -- file-upload-success-event.detail.uuid
  preview_uuid uuid DEFAULT NULL, -- https://uploadcare.com/docs/transformations/document-conversion/
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON files USING btree(file_id);
CREATE INDEX ON files USING btree(account_id);

CREATE INDEX ON files USING btree(project_id);

CREATE INDEX ON files USING btree(subproject_id);

CREATE INDEX ON files USING btree(place_id);

CREATE INDEX ON files USING btree(action_id);

CREATE INDEX ON files USING btree(check_id);

CREATE INDEX ON files USING btree(name);

-- CREATE INDEX ON files((1))
-- WHERE
--   deleted;
COMMENT ON TABLE files IS 'used to store files.';

COMMENT ON COLUMN files.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN files.data IS 'Room for file specific data, defined in "fields" table';

COMMENT ON COLUMN files.mimetype IS 'mimetype of file, used to know how to open or preview it';

-- COMMENT ON COLUMN files.file IS 'file content';
COMMENT ON COLUMN files.url IS 'URL of file, if it is saved on a web service';

ALTER TABLE files ENABLE electric;

-- TODO: this table causes a prisma error, see: https://github.com/electric-sql/electric/issues/716
