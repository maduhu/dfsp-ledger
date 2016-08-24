CREATE TABLE ledger."accountType"
(
  "accountTypeId" serial NOT NULL,
  "name" character varying(25) NOT NULL,
  "code" character varying(20) NOT NULL,
  CONSTRAINT "pkLedgerAccountType" PRIMARY KEY ("accountTypeId")
)
