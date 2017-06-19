CREATE TABLE ledger."quote"
(
  "quoteId" bigserial NOT NULL,
  "uuid" character varying(100) NOT NULL,
  "identifier" character varying(256) NOT NULL,
  "identifierType" varchar(3) NOT NULL,
  "destinationAccount" varchar(100),
  "currencyId" character(3) NOT NULL,
  "amount" numeric(19,2) NOT NULL,
  "fee" numeric(19,2) NOT NULL,
  "commission" numeric(19,2) NOT NULL,
  "transferTypeId" integer NOT NULL,
  "isDebit" boolean NOT NULL,
  "expiresAt" timestamp NOT NULL,
  CONSTRAINT "pkQuoteId" PRIMARY KEY ("quoteId"),
  CONSTRAINT "fkLedgerQuote_transferType" FOREIGN KEY ("transferTypeId")
  REFERENCES ledger."transferType" ("transferTypeId") MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "ukLedgerQuoteUuidIsDebit" UNIQUE ("uuid", "isDebit")
)
