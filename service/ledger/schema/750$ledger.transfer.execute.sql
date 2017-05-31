CREATE OR replace FUNCTION ledger."transfer.execute"(
    "@transferId" varchar,
    "@condition" varchar,
    "@fulfillment" varchar(100),
    "@transferTypeId" integer,
    "@fee" numeric(19,2),
    "@commission" numeric(19,2)
) RETURNS TABLE (
    "id" varchar(100),
    "debitAccount" varchar(20),
    "debitMemo" json,
    "creditAccount" varchar(20),
    "creditMemo" json,
    "amount" numeric(19,2),
    "executionCondition" varchar(100),
    "cancellationCondition" varchar(100),
    "state" varchar(25),
    "expiresAt" timestamp,
    "creationDate" timestamp,
    "proposedAt" timestamp,
    "preparedAt" timestamp,
    "executedAt"timestamp,
    "rejectedAt" timestamp,
    "fulfillment" varchar(100)
) AS
$body$
    #variable_conflict use_column
    DECLARE
        "@executionCondition" varchar(100);
        "@cancellationCondition" varchar(100);
        "@debitAccountId" INT;
        "@creditAccountId" INT;
        "@amount" numeric(19,2);
        "@transferStateId" INT;
        "@transferCode" varchar(20);
        -- GL accounts
        "@feeAccountId" bigint;
        "@commissionAccountId" bigint;
        "@agentCommissionAccountId" bigint;
        -- to check for funds sufficiency
        "@debitBalance" numeric(19,2);
    BEGIN

        SELECT
            t."executionCondition",
            t."cancellationCondition",
            t."debitAccountId",
            t."creditAccountId",
            t."transferStateId",
            t."amount"
        INTO
            "@executionCondition",
            "@cancellationCondition",
            "@debitAccountId",
            "@creditAccountId",
            "@transferStateId",
            "@amount"
        FROM
            ledger.transfer t
        WHERE
            t."uuid" = "@transferId";

        IF ("@transferStateId" != (
              SELECT "transferStateId"
              FROM ledger."transferState"
              WHERE name = 'prepared'
            )
        )
        THEN
            RAISE EXCEPTION 'ledger.transfer.execute.alreadyExists';
        END IF;

        IF ("@condition" = "@executionCondition") THEN
            "@transferCode" := CAST((SELECT ltt."transferCode" FROM ledger."transferType" ltt WHERE ltt."transferTypeId" = "@transferTypeId") as varchar(20));

            IF "@transferCode" IS NULL THEN
                RAISE EXCEPTION 'ledger.transfer.execute.transferCodeNotFound';
            END IF;

            SELECT
                a."accountId"
            INTO
                "@feeAccountId"
            FROM
                ledger.account a
            WHERE
                a."accountTypeId" = (SELECT at."accountTypeId" FROM ledger."accountType" at WHERE at.code = 'f');

            SELECT
                a."accountId"
            INTO
                "@commissionAccountId"
            FROM
                ledger.account a
            WHERE
                a."accountTypeId" = (SELECT at."accountTypeId" FROM ledger."accountType" at WHERE at.code = 'c');

            SELECT
                CAST(a.credit - a.debit AS numeric(19,2))
            INTO
                "@debitBalance"
            FROM
                ledger.account a
            WHERE
                a."accountId" = "@debitAccountId";

            IF "@debitBalance" < ("@amount" + "@fee") THEN
                RAISE EXCEPTION 'ledger.transfer.execute.insufficientFunds';
            END IF;

            IF ("@commission" > 0) THEN
                SELECT
                    a."accountId"
                INTO
                    "@agentCommissionAccountId"
                FROM
                    ledger."account" a
                WHERE
                    -- agent is debit for cash-in operations
                    a."accountTypeId" = (SELECT at."accountTypeId" FROM ledger."accountType" at WHERE at."code" = 'ac')
                    AND
                    a."parentId" = (
                        CASE WHEN "@transferCode" IN ('cashIn')
                        THEN "@debitAccountId"
                        ELSE "@creditAccountId"
                        END
                    );

                IF "@agentCommissionAccountId" IS NOT NULL THEN
                    UPDATE
                        ledger.account
                    SET
                        credit = credit + "@commission"
                    WHERE
                        "accountId" = "@agentCommissionAccountId";

                    UPDATE
                        ledger.account
                    SET
                        debit = debit + "@commission"
                    WHERE
                        "accountId" = "@commissionAccountId";

                    INSERT INTO
                        ledger.commission(
                            "transferDate",
                            "debitAccountId",
                            "creditAccountId",
                            "currencyId",
                            "amount",
                            "transferId"
                        )
                    SELECT
                        t."transferDate",
                        "@commissionAccountId",
                        "@agentCommissionAccountId",
                        t."currencyId",
                        "@commission",
                        t."transferId"
                    FROM
                        ledger.transfer t
                    WHERE
                        t."uuid" = "@transferId";
                END IF;
            END IF;



            IF ("@fee" > 0) THEN
		        UPDATE
                    ledger.account
                SET
                    debit = debit + "@fee"
                WHERE
                    "accountId" = "@debitAccountId";

                UPDATE
                    ledger.account
                SET
                    credit = credit + "@fee"
                WHERE
                    "accountId" = "@feeAccountId";

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
