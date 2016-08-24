CREATE TABLE ledger."transferType"
(
  "transferTypeId" serial NOT NULL,
  "name" character varying(25) NOT NULL,
  "transferCode" character varying(20) NOT NULL,
  CONSTRAINT "pkLedgerTransferType" PRIMARY KEY ("transferTypeId")
)
