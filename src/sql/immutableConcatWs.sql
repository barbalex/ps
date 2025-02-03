-- https://stackoverflow.com/a/54384767/712005
CREATE OR REPLACE FUNCTION immutable_concat_ws(text, VARIADIC text[])
  RETURNS text
  LANGUAGE internal IMMUTABLE PARALLEL SAFE AS
'text_concat_ws';