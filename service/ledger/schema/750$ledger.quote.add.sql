CREATE OR REPLACE FUNCTION ledger."quote.add"(
  "@uuid" character varying(100),
  "@identifier" character varying(25),
  "@identifierType" varchar(3),
  "@currency" character(3),
  "@fee" numeric(19,2),
  "@commission" numeric(19,2),
  "@transferType" character varying(25),
  "@isDebit" boolean,
  "@expiresAt" timestamp
)
RETURNS TABLE(
    "quoteId" bigint,
    "uuid" character varying(100),
    "identifier" character varying(256),
    "identifierType" varchar(3),
    "currencyId" character(3),
    "fee" numeric(19,2),
    "commission" numeric(19,2),
    "transferTypeId" integer,
    "isDebit" boolean,
    "expiresAt" timestamp,
    "isSingleResult" boolean
)
AS
$BODY$
BEGIN
  RETURN QUERY
    INSERT INTO ledger.quote (
      "uuid",
      "identifier",
      "identifierType",
      "currencyId",
      "fee",
      "commission",
      "transferTypeId",
      "isDebit",
      "expiresAt"
    )
    VALUES (
      "@uuid",
      "@identifier",
      "@identifierType",
      "@currency",
      "@fee",
      "@commission",
      (SELECT t."transferTypeId" FROM ledger."transferType" t WHERE t."transferCode" = "@transferType"),
      "@isDebit",
      COALESCE("@expiresAt", (SELECT CURRENT_TIMESTAMP + (5 * interval '1 minute'))) -- make the quote valid for 5 minutes
    )
    RETURNING *, TRUE;
END
$BODY$
LANGUAGE plpgsql
