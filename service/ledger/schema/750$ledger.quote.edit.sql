CREATE OR REPLACE FUNCTION ledger."quote.edit"(
  "@paymentId" character varying(100),
  "@identifier" character varying(25),
  "@identifierType" varchar(3),
  "@destinationAccount" varchar(255),
  "@receiver" varchar(100),
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
    "receiver" varchar(100),
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
  IF NOT EXISTS (SELECT 1 FROM ledger."quote" AS q WHERE q."paymentId" = "@paymentId" and q."isDebit" = false) THEN
    RAISE EXCEPTION 'ledger.quotePaymentIdMissing';
  END IF;

  UPDATE ledger.transfer t SET
    "transferTypeId"= (SELECT tt."transferTypeId" FROM ledger."transferType" tt WHERE tt."transferCode" = "@transferType")
  WHERE
    t."paymentId" = "@paymentId";

  RETURN QUERY
    UPDATE ledger.quote q SET
      "identifier"= "@identifier",
      "identifierType"= "@identifierType",
      "destinationAccount"= "@destinationAccount",
      "receiver"= "@receiver",
      "currencyId"= "@currency",
      "amount"= "@amount",
      "fee"= "@fee",
      "commission"= "@commission",
      "transferTypeId"= (SELECT t."transferTypeId" FROM ledger."transferType" t WHERE t."transferCode" = "@transferType"),
      "ipr"= "@ipr",
      "sourceExpiryDuration"= "@sourceExpiryDuration",
      "connectorAccount"= "@connectorAccount",
      "expiresAt"= COALESCE("@expiresAt", (SELECT CURRENT_TIMESTAMP + (5 * interval '1 minute'))), -- make the quote valid for 5 minutes
      "params"= "@params"
    WHERE
      q."paymentId" = "@paymentId"
      AND q."isDebit" = "@isDebit"
    RETURNING *, TRUE;
END
$BODY$
LANGUAGE plpgsql
