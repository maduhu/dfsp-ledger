CREATE OR REPLACE FUNCTION ledger."transferType.fetch" ()
RETURNS TABLE (
  "transferTypeId" INTEGER,
  "name" character varying(25),
  "transferCode" character varying(20)
) AS
$body$
    SELECT
        tt."transferTypeId",
        tt."name",
        tt."transferCode"
    FROM
        ledger."transferType" tt
$body$
LANGUAGE 'sql'
