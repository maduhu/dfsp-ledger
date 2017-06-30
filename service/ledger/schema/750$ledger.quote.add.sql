CREATE OR REPLACE FUNCTION ledger."quote.add"(
  "@paymentId" character varying(100),
  "@identifier" character varying(25),
  "@identifierType" varchar(3),
  "@destinationAccount" varchar(100),
  "@receiver" varchar(100),
  "@currency" character(3),
  "@amount" numeric(19,2),
  "@fee" numeric(19,2),
  "@commission" numeric(19,2),
  "@transferType" character varying(25),
  "@ipr" varchar(255),
  "@sourceExpiryDuration" integer,
  "@isDebit" boolean,
  "@expiresAt" timestamp
)
RETURNS TABLE(
    "quoteId" bigint,
    "paymentId" character varying(100),
    "identifier" character varying(256),
    "identifierType" varchar(3),
    "destinationAccount" varchar(100),
    "receiver" varchar(100),
    "currencyId" character(3),
    "amount" numeric(19,2),
    "fee" numeric(19,2),
    "commission" numeric(19,2),
    "transferTypeId" integer,
    "ipr" varchar(255),
    "sourceExpiryDuration" integer,
    "connectorAccount" varchar(100),
    "isDebit" boolean,
    "expiresAt" timestamp,
    "isSingleResult" boolean
)
AS
$BODY$
BEGIN
  RETURN QUERY
    INSERT INTO ledger.quote (
      "paymentId",
      "identifier",
      "identifierType",
      "destinationAccount",
      "receiver",
      "currencyId",
      "amount",
      "fee",
      "commission",
      "transferTypeId",
      "ipr",
      "sourceExpiryDuration",
      "connectorAccount",
      "isDebit",
      "expiresAt"
    )
    VALUES (
      "@paymentId",
      "@identifier",
      "@identifierType",
      "@destinationAccount",
      "@receiver",
      "@currency",
      "@amount",
      "@fee",
      "@commission",
      (SELECT t."transferTypeId" FROM ledger."transferType" t WHERE t."transferCode" = "@transferType"),
      "@ipr",
      "@sourceExpiryDuration",
      (
        SELECT a."accountNumber"
        FROM ledger."account" a
        JOIN ledger."accountType" at
          ON a."accountTypeId" = at."accountTypeId"
        WHERE at."code" = 'con'
      ),
      "@isDebit",
      COALESCE("@expiresAt", (SELECT CURRENT_TIMESTAMP + (5 * interval '1 minute'))) -- make the quote valid for 5 minutes
    )
    RETURNING *, TRUE;
END
$BODY$
LANGUAGE plpgsql
