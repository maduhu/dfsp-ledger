CREATE TABLE ledger.account
(
  "accountId" serial NOT NULL,
  "name" character varying(25) NOT NULL,
  "displayName" character varying(100),
  "accountNumber" character varying(20),
  "credit" money NOT NULL,
  "debit" money NOT NULL,
  "accountTypeId" integer NOT NULL,
  "isActive" bit(1) NOT NULL,
  "parentId" integer,
  "creationDate" timestamp without time zone NOT NULL,
  "currencyId" character(3) NOT NULL,
  CONSTRAINT "pkAccount" PRIMARY KEY ("accountId"),
  CONSTRAINT "fkAccount_accountType" FOREIGN KEY ("accountTypeId") REFERENCES ledger."accountType" ("accountTypeId") MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "fkAccount_currency" FOREIGN KEY ("currencyId") REFERENCES ledger.currency ("currencyId") MATCH SIMPLE  ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "fkAccount_account" FOREIGN KEY ("parentId") REFERENCES ledger.account ("accountId") MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "ukAccountAccountNumber" UNIQUE ("accountNumber")
)
