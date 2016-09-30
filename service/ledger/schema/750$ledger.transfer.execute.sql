﻿CREATE OR replace FUNCTION ledger."transfer.execute"(
    "@transferId" CHARACTER varying ,
    "@condition" CHARACTER varying ,
    "@fulfillment" CHARACTER varying(100)
) RETURNS TABLE (
    "id" character varying(100),
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
$body$
    #variable_conflict use_column
    DECLARE
        "@executionCondition" CHARACTER varying(100);
        "@cancellationCondition" CHARACTER varying(100);
        "@debitAccountId"  INT;
        "@creditAccountId" INT;
        "@creditBalance"   numeric(19,2);
        "@amount"          numeric(19,2);
        "@transferStateId" INT;
    BEGIN
        SELECT
            t."executionCondition",
            t."cancellationCondition",
            t."debitAccountId",
            t."creditAccountId",
            t."transferStateId",
            t.amount
        INTO
            "@executionCondition" ,
            "@cancellationCondition" ,
            "@debitAccountId" ,
            "@creditAccountId" ,
            "@transferStateId",
            "@amount"
        FROM
            ledger.transfer t
        WHERE
            t."uuid" = "@transferId";

        SELECT
            a.credit - a.debit
        INTO
            "@creditBalance"
        FROM
            ledger.account a
        WHERE
            a."accountId" = "@creditAccountId";

        IF ("@transferStateId" != (
              SELECT "transferStateId"
              FROM   ledger."transferState"
              WHERE  name = 'prepared'
            )
        )
        THEN
            RAISE EXCEPTION 'ledger.transferIsProcessedAlready';
        END IF ;

        IF ("@condition" = "@cancellationCondition") THEN
            UPDATE
              ledger.transfer
            SET
              "transferStateId" = (
                  SELECT "transferStateId"
                  FROM   ledger."transferState" ts
                  WHERE  ts.name = 'rejected' ) ,
              fulfillment = "@fulfillment",
              "rejectedAt"=NOW()
            WHERE
              "uuid" = "@transferId";
        END IF ;

        IF ("@condition" = "@executionCondition") THEN
            IF "@creditBalance" < "@amount" THEN
                RAISE EXCEPTION 'ledger.insufficientFunds';
            END IF ;

            UPDATE
                ledger.account
            SET
                debit = debit + "@amount"
            WHERE
                "accountId" = "@debitAccountId";

            UPDATE
                ledger.account
            SET
                credit = credit + "@amount"
            WHERE
                "accountId" = "@creditAccountId";

            UPDATE
                ledger.transfer
            SET
                "transferStateId" = (
                    SELECT "transferStateId"
                    FROM   ledger."transferState" ts
                    WHERE  ts.name = 'executed' ) ,
                fulfillment = "@fulfillment",
                "executedAt"=NOW()
            WHERE
                "uuid" = "@transferId";
        END IF ;

        RETURN query
        SELECT
            *
        FROM
            ledger."transfer.get"("@transferId");

    END
$body$ LANGUAGE plpgsql