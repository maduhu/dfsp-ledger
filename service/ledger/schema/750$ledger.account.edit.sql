CREATE OR REPLACE FUNCTION ledger."account.edit"(
  "@accountNumber" character varying(100),
  "@debit" "numeric"(19,2),
  "@credit" "numeric"(19,2),
  "@name" character varying(20),
  "@accountTypeId" INT,
  "@currencyId" char(3),
  "@isDisabled" boolean
)
RETURNS TABLE(
    "accountNumber" character varying(100),
    "balance" "numeric"(19,2),
    "currency" character(3),
    "name" character varying(20)
)
AS
$BODY$
   #variable_conflict use_column
BEGIN
UPDATE
  ledger.account
SET
  "name" = COALESCE("@name", "name"),
  "credit" = COALESCE("@credit", "credit"),
  "debit" = COALESCE("@debit", "debit"),
  "accountTypeId" = COALESCE("@accountTypeId", "accountTypeId"),
  "isDisabled" = COALESCE("@isDisabled", "isDisabled"),
  "currencyId" = COALESCE("@currencyId", "currencyId")
WHERE
  "accountNumber" = "@accountNumber";

return QUERY
    SELECT
      a."accountNumber",
      a.credit-a.debit,
      a."currencyId",
      a."name"
  FROM
      ledger."account" a
  WHERE
      a."accountNumber" = "@accountNumber";

END
$BODY$
LANGUAGE plpgsql
