CREATE TABLE ledger.transfer
(
  "transferId" bigserial NOT NULL,
  "uuid" character varying(100) NOT NULL,
  "transferDate" timestamp without time zone NOT NULL,
  "transferTypeId" integer NOT NULL,
  "debitAccountId" integer NOT NULL,
  "creditAccountId" integer NOT NULL,
  "currencyId" character(3) NOT NULL,
  "fulfillment" character varying(100),
  "amount" money NOT NULL,
  "description" text,
  "creationDate" timestamp without time zone NOT NULL,
  CONSTRAINT "pkLedgerTransaction" PRIMARY KEY ("transferId"),
  CONSTRAINT "fkLedgerTransaction_debitAccount" FOREIGN KEY ("debitAccountId") REFERENCES ledger.account ("accountId") MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "fkLedgerTransaction_creditAccount" FOREIGN KEY ("creditAccountId") REFERENCES ledger.account ("accountId") MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "fkLedgerTransaction_currency" FOREIGN KEY ("currencyId") REFERENCES ledger.currency ("currencyId") MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "fkLedgerTransaction_transferType" FOREIGN KEY ("transferTypeId") REFERENCES ledger."transferType" ("transferTypeId") MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION
)
