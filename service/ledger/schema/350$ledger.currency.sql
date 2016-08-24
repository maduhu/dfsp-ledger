CREATE TABLE ledger."currency"
(
  "currencyId" character(3) NOT NULL,
  "name" character varying(100),
  CONSTRAINT "pkLedgerCurrency" PRIMARY KEY ("currencyId")
)
