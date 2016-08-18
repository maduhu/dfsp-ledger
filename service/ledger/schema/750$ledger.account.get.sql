CREATE OR REPLACE FUNCTION ledger."account.get"("accountNumber" character varying)
RETURNS
    TABLE("displayName" character varying(100), "accountNumber" character varying(20), "currencyId" character(3))
AS
$BODY$
    SELECT
        a."displayName",
        a."accountNumber",
        a."currencyId"
    FROM
        ledger."account" a
    WHERE
        a."accountNumber"="accountNumber"
$BODY$
LANGUAGE SQL
