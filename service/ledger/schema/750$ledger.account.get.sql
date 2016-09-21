CREATE OR REPLACE FUNCTION ledger."account.get" (
  "accountNumber" varchar
)
RETURNS TABLE (
  "accountNumber" varchar,
  balance numeric(19,2),
  "isDisable" bit
) AS
$body$
    SELECT
        a."accountNumber",
        a.credit-a.debit,
        case when a."isActive"=CAST(1 as bit) then CAST(1 as bit) else CAST(0 as bit) end
    FROM
        ledger."account" a
    WHERE
        a."accountNumber"="accountNumber"
$body$
LANGUAGE 'sql'
 