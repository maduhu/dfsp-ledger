CREATE TABLE ledger.account
(
  "accountId" serial NOT NULL,
  "name" character varying(50) NOT NULL,
  "displayName" character varying(100),
  "accountNumber" character varying(50),
  "credit" numeric(19,2) NOT NULL,
  "debit" numeric(19,2) NOT NULL,
  "accountTypeId" integer NOT NULL,
  "isActive" bit(1) NOT NULL,
  "parentId" integer,
  "creationDate" timestamp without time zone NOT NULL,
  "currencyId" character(3) NOT NULL,
  CONSTRAINT "pkLedgerAccount" PRIMARY KEY ("accountId"),
  CONSTRAINT "fkLedgerAccount_accountType" FOREIGN KEY ("accountTypeId") REFERENCES ledger."accountType" ("accountTypeId") MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "fkLedgerAccount_currency" FOREIGN KEY ("currencyId") REFERENCES ledger.currency ("currencyId") MATCH SIMPLE  ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "fkLedgerAccount_account" FOREIGN KEY ("parentId") REFERENCES ledger.account ("accountId") MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "ukLedgerAccountAccountNumber" UNIQUE ("accountNumber")
)
