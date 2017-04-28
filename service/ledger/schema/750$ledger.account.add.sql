CREATE OR REPLACE FUNCTION ledger."account.add"(
    "@accountNumber" character varying(100),
    "@parentAccountNumber" character varying(100),
    "@debit" "numeric"(19,2),
    "@credit" "numeric"(19,2),
    "@name" character varying(20),
    "@isDisabled" boolean,
    "@accountTypeId" INT,
    "@currencyId" char(3)
)
RETURNS TABLE(
    "accountNumber" character varying(100),
    "balance" "numeric"(19,2),
    "currency" character(3),
    "isDisabled" boolean
)
AS
$BODY$
    DECLARE
        "@accountId" BIGINT := (SELECT nextval('ledger."account_accountId_seq"'));
        "@parentId" BIGINT := NULL;
BEGIN

IF EXISTS (SELECT 1 FROM ledger.account a WHERE a."accountNumber" = COALESCE("@accountNumber", "@name")) THEN
    RAISE EXCEPTION 'ledger.account.add.exists';
END IF;
IF ("@parentAccountNumber" IS NOT NULL) THEN
    SELECT
        a."accountId"
    INTO
        "@parentId"
    FROM
        ledger."account" a WHERE a."accountNumber" = "@parentAccountNumber";

    IF "@parentId" IS NULL THEN
        RAISE EXCEPTION 'ledger.account.add.parentAccountNotFound';
    END IF;
END IF;

INSERT INTO
  ledger.account
  (
      "accountId",
      "name",
      "accountNumber",
      "credit",
      "debit",
      "accountTypeId",
      "isDisabled",
      "parentId",
      "creationDate",
      "currencyId"
  )
  VALUES (
      "@accountId",
      "@name",
      COALESCE("@accountNumber", "@name"),
      "@credit",
      "@debit",
      "@accountTypeId",
      COALESCE("@isDisabled", FALSE),
      "@parentId",
      now(),
      "@currencyId"
  );

  RETURN QUERY
  SELECT
      a."accountNumber",
      a.credit-a.debit,
      a."currencyId",
      a."isDisabled"
  FROM
      ledger."account" a
  WHERE
      a."accountId"="@accountId";

 END
$BODY$
LANGUAGE plpgsql
