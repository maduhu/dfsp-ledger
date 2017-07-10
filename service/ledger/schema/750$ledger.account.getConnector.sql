CREATE OR REPLACE FUNCTION ledger."account.getConnector" (
)
RETURNS TABLE (
  "accountNumber" varchar,
  "balance" numeric(19,2),
  "currencyCode" character(3),
  "currencySymbol" varchar(10),
  "name" varchar(50),
  "accountType" character varying(25),
  "isDisabled" boolean,
  "isSingleResult" boolean
) AS
$body$
    SELECT
        a."accountNumber" AS "accountNumber",
        a.credit-a.debit AS "balance",
        a."currencyId" AS "currencyCode",
        c."symbol" AS "currencySymbol",
        a."name" AS "name",
        act."name" as "accountType",
        a."isDisabled" AS "isDisabled",
        true AS "isSingleResult"
    FROM
        ledger."account" a
    JOIN
        ledger."currency" c ON a."currencyId" = c."currencyId"
    JOIN
        ledger."accountType" act on act."accountTypeId" = a."accountTypeId"
    WHERE
        act."code" = 'con' and a."isDisabled" = FALSE
    LIMIT 1
$body$
LANGUAGE 'sql'
