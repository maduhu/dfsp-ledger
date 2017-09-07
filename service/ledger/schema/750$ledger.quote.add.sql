CREATE OR REPLACE FUNCTION ledger."quote.add"(
  "@paymentId" character varying(100),
  "@identifier" character varying(25),
  "@identifierType" varchar(3),
  "@destinationAccount" varchar(255),
  "@receiver" varchar(256),
  "@currency" character(3),
  "@amount" numeric(19,2),
  "@fee" numeric(19,2),
  "@commission" numeric(19,2),
  "@transferType" character varying(25),
  "@ipr" varchar,
  "@sourceExpiryDuration" integer,
  "@connectorAccount" varchar,
  "@isDebit" boolean,
  "@expiresAt" timestamp,
  "@params" json
)
RETURNS TABLE(
    "quoteId" bigint,
    "paymentId" character varying(100),
    "identifier" character varying(256),
    "identifierType" varchar(3),
    "destinationAccount" varchar(255),
    "receiver" varchar(256),
    "currencyId" character(3),
    "amount" numeric(19,2),
    "fee" numeric(19,2),
    "commission" numeric(19,2),
    "transferTypeId" integer,
    "ipr" varchar,
    "sourceExpiryDuration" integer,
    "connectorAccount" varchar,
    "isDebit" boolean,
    "expiresAt" timestamp,
    "params" json,
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
      "expiresAt",
      "params"
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
      "@connectorAccount",
      "@isDebit",
      COALESCE("@expiresAt", (SELECT CURRENT_TIMESTAMP + (5 * interval '1 minute'))), -- make the quote valid for 5 minutes
      "@params"
    )
    RETURNING *, TRUE;
END
$BODY$
LANGUAGE plpgsql
