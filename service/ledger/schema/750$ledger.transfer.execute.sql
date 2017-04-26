CREATE OR replace FUNCTION ledger."transfer.execute"(
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
        "@fee" numeric(19,2);
        "@amount"          numeric(19,2);
        "@transferStateId" INT;

        "@feeAccountId" bigint;

        "@debitBalance"   numeric(19,2);
    BEGIN
        SELECT
            t."executionCondition",
            t."cancellationCondition",
            t."debitAccountId",
            t."creditAccountId",
            COALESCE(CAST(t."creditMemo"->>'fee' AS numeric(19,2)), 0),
            t."transferStateId",
            t.amount
        INTO
            "@executionCondition",
            "@cancellationCondition",
            "@debitAccountId",
            "@creditAccountId",
            "@fee",
            "@transferStateId",
            "@amount"
        FROM
            ledger.transfer t
        WHERE
            t."uuid" = "@transferId";

        SELECT
            a."accountId"
        INTO
            "@feeAccountId"
        FROM
            ledger.account a
        JOIN
            ledger."accountType" at ON a."accountTypeId" = at."accountTypeId"
        WHERE
            at."code" = 'f';

        SELECT
            CAST(a.credit - a.debit AS numeric(19,2))
        INTO
            "@debitBalance"
        FROM
            ledger.account a
        WHERE
            a."accountId" = "@debitAccountId";

        IF ("@transferStateId" != (
              SELECT "transferStateId"
              FROM   ledger."transferState"
              WHERE  name = 'prepared'
            )
        )
        THEN
            RAISE EXCEPTION 'ledger.transfer.execute.alreadyExists';
        END IF;

        IF ("@condition" = "@executionCondition") THEN
            IF "@debitBalance" < ("@amount" + "@fee") THEN
                RAISE EXCEPTION 'ledger.transfer.execute.insufficientFunds';
            END IF ;

            UPDATE
                ledger.account
            SET
                debit = debit + "@amount" + "@fee"
            WHERE
                "accountId" = "@debitAccountId";

            UPDATE
                ledger.account
            SET
                credit = credit + "@amount"
            WHERE
                "accountId" = "@creditAccountId";

            UPDATE
                ledger.account
            SET
                credit = credit + "@fee"
            WHERE
                "accountId" = "@feeAccountId";

            UPDATE
                ledger.transfer
            SET
                "transferStateId" = (
                    SELECT
                        "transferStateId"
                    FROM
                        ledger."transferState" ts
                    WHERE
                        ts.name = 'executed'
                ),
                fulfillment = "@fulfillment",
                "executedAt"=NOW()
            WHERE
                "uuid" = "@transferId";

            IF ("@fee" > 0) THEN
                INSERT INTO
                    ledger.fee(
                        "transferDate",
                        "debitAccountId",
                        "creditAccountId",
                        "currencyId",
                        "amount",
                        "transferId"
                    )
                SELECT
                    t."transferDate",
                    "@debitAccountId",
                    "@feeAccountId",
                    t."currencyId",
                    "@fee",
                    t."transferId"
                FROM
                    ledger.transfer t
                WHERE
                    t."uuid" = "@transferId";
            END IF;
        ELSEIF ("@condition" = "@cancellationCondition") THEN
            UPDATE
              ledger.transfer
            SET
                "transferStateId" = (
                    SELECT
                    "transferStateId"
                    FROM
                    ledger."transferState" ts
                    WHERE
                    ts.name = 'rejected'
                ),
                fulfillment = "@fulfillment",
                "rejectedAt"=NOW()
            WHERE
              "uuid" = "@transferId";
        END IF;

        RETURN query
        SELECT
            *
        FROM
            ledger."transfer.get"("@transferId");

    END
$body$ LANGUAGE plpgsql
