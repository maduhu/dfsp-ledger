CREATE OR REPLACE FUNCTION ledger."account.get" (
  "@accountNumber" varchar
)
RETURNS TABLE (
  "accountNumber" varchar,
  "balance" numeric(19,2),
  "currencyCode" character(3),
  "currencySymbol" varchar(10),
  "isDisabled" boolean
) AS
$body$
    SELECT
        a."accountNumber" AS "accountNumber",
        a.credit-a.debit AS "balance",
        a."currencyId" AS "currencyCode",
        c."symbol" AS "currencySymbol",
        a."isDisabled" AS "isDisabled"
    FROM
        ledger."account" a
    JOIN
        ledger."currency" c ON a."currencyId" = c."currencyId"
    WHERE
        a."accountNumber"="@accountNumber" and a."isDisabled" = FALSE
$body$
LANGUAGE 'sql'
