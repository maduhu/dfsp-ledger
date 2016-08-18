CREATE OR REPLACE FUNCTION ledger."transfer.execute"("transferId" character varying,fulfillment character varying(100))
RETURNS
    TABLE(fulfillment character varying(100))
AS
$BODY$
    SELECT
        t.fulfillment
    FROM
        ledger.transfer AS t
    WHERE
        t."transferId" = "transferId"
$BODY$
LANGUAGE SQL
