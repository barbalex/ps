-- https://www.postgresql.org/message-id/3768124.1713995696%40sss.pgh.pa.us
-- way to make generated always function dealing with dates immutable
create function immutabledate(date) returns text
strict immutable parallel safe
as $$ begin return to_char($1::date, 'YYYY.MM.DD'); end $$
language plpgsql;