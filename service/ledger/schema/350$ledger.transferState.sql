CREATE TABLE ledger."transferState"
(
  "transferStateId" serial NOT NULL,
  "name" character varying(25) NOT NULL,
  "transferStateCode" character varying(20) NOT NULL,
  CONSTRAINT "pkLedgerTransferState" PRIMARY KEY ("transferStateId")
)
