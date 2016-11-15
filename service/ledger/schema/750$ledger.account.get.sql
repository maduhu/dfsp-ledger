CREATE OR REPLACE FUNCTION ledger."account.get" (
  "@accountNumber" varchar
)
RETURNS TABLE (
  "accountNumber" varchar,
  "balance" numeric(19,2),
  "currencyCode" character(3),
  "currencySymbol" varchar(10),
  "isDisable" bit
) AS
$body$
    SELECT
        a."accountNumber" AS "accountNumber",
        a.credit-a.debit AS "balance",
        a."currencyId" AS "currencyCode",
        c."symbol" AS "currencySymbol",
        case when a."isActive"=CAST(1 as bit) then CAST(1 as bit) else CAST(0 as bit) end AS "isDisable"
    FROM
        ledger."account" a
    JOIN
        ledger."currency" c ON a."currencyId" = c."currencyId"
    WHERE
        a."accountNumber"="@accountNumber"
$body$
LANGUAGE 'sql'
