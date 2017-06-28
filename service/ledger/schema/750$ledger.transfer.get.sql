CREATE OR REPLACE FUNCTION ledger."transfer.get"(
    "@paymentId" character varying(100)
) RETURNS TABLE (
    "paymentId" character varying(100),
    "debitAccount" character varying(20),
    "debitMemo" json,
    "creditAccount" character varying(20),
    "creditMemo" json,
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
) AS
$BODY$
    SELECT
        t."paymentId" AS "paymentId",
        debit."accountNumber" "debitAccount" ,
        t."debitMemo",
        credit."accountNumber" "creditAccount" ,
        t."creditMemo",
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
    FROM
        ledger.transfer t
    JOIN
        ledger.account debit on t."debitAccountId"=debit."accountId"
    JOIN
        ledger.account credit on t."creditAccountId"=credit."accountId"
    JOIN
        ledger."transferState" ts on t."transferStateId"=ts."transferStateId"
    WHERE
        t."paymentId"="@paymentId";
$BODY$ LANGUAGE SQL
