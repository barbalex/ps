-- from: https://gist.github.com/kjmph/5bd772b2c2df145aa645b837da7eca74
-- Based off IETF draft, https://datatracker.ietf.org/doc/draft-peabody-dispatch-new-uuid-format/
-- example usage:
-- uuid_statement uuid DEFAULT public.uuid_generate_v7() PRIMARY KEY
--
CREATE OR REPLACE FUNCTION uuid_generate_v7()
  RETURNS uuid
  AS $$
BEGIN
  -- use random v4 uuid as starting point (which has the same variant we need)
  -- then overlay timestamp
  -- then set version 7 by flipping the 2 and 1 bit in the version 4 string
  RETURN encode(set_bit(set_bit(overlay(uuid_send(gen_random_uuid())
        PLACING substring(int8send(floor(extract(epoch FROM clock_timestamp()) * 1000)::bigint)
        FROM 3)
      FROM 1 FOR 6), 52, 1), 53, 1), 'hex')::uuid;
END
$$
LANGUAGE plpgsql
VOLATILE;

-- Generate a custom UUID v8 with microsecond precision
CREATE OR REPLACE FUNCTION uuid_generate_v8()
  RETURNS uuid
  AS $$
DECLARE
  timestamp timestamptz;
  microseconds int;
BEGIN
  timestamp = clock_timestamp();
  microseconds =(cast(extract(microseconds FROM timestamp)::int -(floor(extract(milliseconds FROM timestamp))::int * 1000) AS double precision) * 4.096)::int;
  -- use random v4 uuid as starting point (which has the same variant we need)
  -- then overlay timestamp
  -- then set version 8 and add microseconds
  RETURN encode(set_byte(set_byte(overlay(uuid_send(gen_random_uuid())
        PLACING substring(int8send(floor(extract(epoch FROM timestamp) * 1000)::bigint)
          FROM 3)
        FROM 1 FOR 6), 6,(b'1000' ||(microseconds >> 8)::bit(4))::bit(8)::int), 7, microseconds::bit(8)::int), 'hex')::uuid;
END
$$
LANGUAGE plpgsql
VOLATILE;

