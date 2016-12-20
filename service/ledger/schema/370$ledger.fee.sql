CREATE TABLE ledger."fee"
(
  "feeId" bigserial NOT NULL,
  "transferDate" timestamp without time zone NOT NULL,
  "debitAccountId" integer NOT NULL,
  "creditAccountId" integer NOT NULL,
  "currencyId" character(3) NOT NULL,
  "amount" numeric(19,2) NOT NULL,
  "transferId" bigint NOT NULL,
  CONSTRAINT "pkLedgerFee" PRIMARY KEY ("feeId"),
  CONSTRAINT "fkLedgerFee_debitAccount" FOREIGN KEY ("debitAccountId") REFERENCES ledger.account ("accountId") MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "fkLedgerFee_creditAccount" FOREIGN KEY ("creditAccountId") REFERENCES ledger.account ("accountId") MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "fkLedgerFee_currency" FOREIGN KEY ("currencyId") REFERENCES ledger.currency ("currencyId") MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "fkLedgerFee_transfer" FOREIGN KEY ("transferId") REFERENCES ledger.transfer ("transferId") MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION
)
