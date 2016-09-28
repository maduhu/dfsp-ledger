CREATE OR REPLACE FUNCTION ledger."account.remove"(
  "@accountNumber" character varying(25)
) RETURNS TABLE(
  "accountNumber" CHARACTER varying(25),
  "isSingleResult" boolean
)
AS
$body$
  WITH a as (
    DELETE FROM ledger.account
    WHERE "accountNumber" = "@accountNumber"
    RETURNING *
  )
  SELECT
    a."accountNumber",
    true AS "isSingleResult"
  FROM a
$body$
LANGUAGE SQL