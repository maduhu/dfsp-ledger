CREATE OR REPLACE FUNCTION ledger."accountType.fetch"(

)
RETURNS TABLE(
    "accountTypeId" int,
    "name" varchar(25),
    "code" varchar(20)
)
AS
$BODY$
  BEGIN
    RETURN QUERY
      SELECT
          at."accountTypeId",
          at."name",
          at."code"
      FROM
          ledger."accountType" at;
  END
$BODY$
LANGUAGE plpgsql
