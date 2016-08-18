CREATE OR REPLACE FUNCTION ledger."transfer.hold"("transferId" character varying)
RETURNS
    TABLE(id character varying(100), debit character varying(20), credit character varying(20), amount money, currency character(3))
AS
$BODY$
    SELECT
        t.uuid as id,
        debit."accountNumber" as debit,
        credit."accountNumber" as credit,
        t.amount,
        t."currencyId" as currency
    FROM
        ledger.transfer AS t
    LEFT JOIN
        ledger.account AS debit ON t."debitAccountId" = debit."accountId"
    LEFT JOIN
        ledger.account AS credit ON t."creditAccountId" = debit."accountId"
    WHERE
        t."transferId" = "transferId"
$BODY$
LANGUAGE SQL
