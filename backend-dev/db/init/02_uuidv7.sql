-- from: https://gist.github.com/kjmph/5bd772b2c2df145aa645b837da7eca74
-- Based off IETF draft, https://datatracker.ietf.org/doc/draft-peabody-dispatch-new-uuid-format/
-- example usage:
-- uuid_statement uuid DEFAULT public.uuid_generate_v7() PRIMARY KEY
-- hopefully this will be in core postgresql in version 17: https://commitfest.postgresql.org/43/4388/
-- Not running now as electric-sql does not support it
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

