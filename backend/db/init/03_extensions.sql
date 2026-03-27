CREATE EXTENSION temporal_tables;
CREATE EXTENSION postgis;
CREATE SCHEMA partman;
CREATE EXTENSION pg_partman SCHEMA partman;
-- TODO: add dedicated user for pg_partman
-- see: https://neon.com/docs/extensions/pg_partman#enable-the-pgpartman-extension