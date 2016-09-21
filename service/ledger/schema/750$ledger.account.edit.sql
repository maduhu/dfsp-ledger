CREATE OR REPLACE FUNCTION ledger."account.edit"("@accountNumber" character varying(100)
,"@debit" "numeric"(19,2)
,"@credit" "numeric"(19,2)
,"@name" character varying(20)
,"@displayName" character varying(100)
,"@accountTypeId" INT
,"@currencyId" char(3)

)
RETURNS
    TABLE("accountNumber" character varying(100)
    , "balance" "numeric"(19,2)
    , "isActive" bit
   )
AS
$BODY$
  declare
  "@accountId" BIGINT:=(SELECT nextval('ledger."account_accountId_seq"'));
BEGIN
INSERT INTO
  ledger.account
(
  "accountId",
  name,
  "displayName",
  "accountNumber",
  credit,
  debit,
  "accountTypeId",
  "isActive",
  "parentId",
  "creationDate",
  "currencyId"
)
VALUES (
  "@accountId",
  "@name",
 "@displayName",
  "@accountNumber",
  "@credit",
  "@debit",
  "@accountTypeId",
  CAST(1 as BIT),
  NULL,
  now(),
  "@currencyId"
);



  return QUERY
      SELECT
        a."accountNumber",
        a.credit-a.debit,
        a."isActive"
    FROM
        ledger."account" a
    WHERE
        a."accountId"="@accountId";

 END
$BODY$
LANGUAGE plpgsql
	