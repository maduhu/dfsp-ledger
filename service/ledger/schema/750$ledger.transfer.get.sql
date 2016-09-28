CREATE OR REPLACE FUNCTION ledger."transfer.get"("@uuid" character varying(100)
)
RETURNS
    TABLE(
		"id" character varying(100),
		"debitAccount" character varying(20),
		"creditAccount" character varying(20),
		"amount" numeric(19,2),
		"executionCondition" character varying(100),
		"cancellationCondition" character varying(100),
		"state" character varying(25),
		"expiresAt" timestamp,
		"creationDate" timestamp,
		"proposedAt" timestamp,
		"preparedAt" timestamp,
		"executedAt"timestamp,
		"rejectedAt" timestamp,
		"fulfillment" character varying(100)
	)
AS
$BODY$
    SELECT
	t.uuid as id,
	debit."accountNumber" "debitAccount" ,
	credit."accountNumber" "creditAccount" ,
	t.amount,
	t."executionCondition",
	t."cancellationCondition",
	ts.name state,
	t."expiresAt",
	t."creationDate",
	t."proposedAt",
	t."preparedAt",
	t."executedAt",
	t."rejectedAt",
	t."fulfillment"
  FROM ledger.transfer t
	join ledger.account debit on t."debitAccountId"=debit."accountId"
	join ledger.account credit on t."creditAccountId"=credit."accountId"
	join ledger."transferState" ts on t."transferStateId"=ts."transferStateId"
	where t.uuid="@uuid"
	;

$BODY$
LANGUAGE SQL
