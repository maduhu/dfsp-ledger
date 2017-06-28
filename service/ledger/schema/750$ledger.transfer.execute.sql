CREATE OR replace FUNCTION ledger."transfer.execute"(
    "@paymentId" varchar,
    "@condition" varchar,
    "@fulfillment" varchar(100)
) RETURNS TABLE (
    "paymentId" character varying(100),
    "debitAccount" character varying(20),
    "debitMemo" json,
    "creditAccount" character varying(20),
    "creditMemo" json,
    "amount" numeric(19,2),
    "executionCondition" character varying(100),
    "cancellationCondition" character varying(100),
    "state" character varying(20),
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
        "@executionCondition" varchar(100);
        "@cancellationCondition" varchar(100);
        "@debitAccountId" INT;
        "@creditAccountId" INT;
        "@amount" numeric(19,2);
        "@transferStateId" INT;
        -- GL accounts
        "@feeAccountId" bigint;
        "@commissionAccountId" bigint;
        -- agent commission account
        "@debitCommissionAccountId" bigint;
        "@creditCommissionAccountId" bigint;
        -- to check for funds sufficiency
        "@debitBalance" numeric(19,2);
        -- quotes
        "@debitCommission" numeric(19,2):=0;
        "@creditCommission" numeric(19,2):=0;
        "@debitFee" numeric(19,2):=0;
        "@creditFee" numeric(19,2):=0;
    BEGIN
        -- transfer prerequesites
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
            t."paymentId" = "@paymentId";

        IF ("@transferStateId" != (
              SELECT "transferStateId"
              FROM ledger."transferState"
              WHERE name = 'prepared'
            )
        )
        THEN
            RAISE EXCEPTION 'ledger.transfer.execute.alreadyExists';
        END IF;

        -- quotes
        IF EXISTS (
            SELECT
                1
            FROM
                ledger.account a
            WHERE
                a."accountId" = "@debitAccountId"
                AND a."accountTypeId" = (
                    SELECT
                        at."accountTypeId"
                    FROM
                        ledger."accountType" at
                    WHERE
                        at.code = 'mw'
                )
        ) THEN
            SELECT
                dq."commission",
                dq."fee"
            FROM
                ledger."quote.get"("@paymentId", true) dq
            INTO
                "@debitCommission",
                "@debitFee";
        END IF;

        IF EXISTS (
            SELECT
                1
            FROM
                ledger.account a
            WHERE
                a."accountId" = "@creditAccountId"
                AND a."accountTypeId" = (
                    SELECT
                        at."accountTypeId"
                    FROM
                        ledger."accountType" at
                    WHERE
                        at.code = 'mw'
                )
        ) THEN
            SELECT
                cq."commission",
                cq."fee"
            FROM
                ledger."quote.get"("@paymentId", false) cq
            INTO
                "@creditCommission",
                "@creditFee";
        END IF;


        IF ("@condition" = "@executionCondition") THEN
            SELECT
                a."accountId"
            INTO
                "@feeAccountId"
            FROM
                ledger.account a
            WHERE
                a."accountTypeId" = (
                    SELECT
                        at."accountTypeId"
                    FROM
                        ledger."accountType" at
                    WHERE
                        at.code = 'f'
                );

            SELECT
                a."accountId"
            INTO
                "@commissionAccountId"
            FROM
                ledger.account a
            WHERE
                a."accountTypeId" = (
                    SELECT
                        at."accountTypeId"
                    FROM
                        ledger."accountType" at
                    WHERE
                        at.code = 'c'
                );

            SELECT
                CAST(a.credit - a.debit AS numeric(19,2))
            INTO
                "@debitBalance"
            FROM
                ledger.account a
            WHERE
                a."accountId" = "@debitAccountId";

            IF "@debitBalance" < ("@amount" + "@debitFee") THEN
                RAISE EXCEPTION 'ledger.transfer.execute.insufficientFunds';
            END IF;

            IF ("@creditCommission" > 0) THEN
                SELECT
                    a."accountId"
                INTO
                    "@creditCommissionAccountId"
                FROM
                    ledger."account" a
                WHERE
                    a."parentId" = "@creditAccountId"
                    AND a."accountTypeId" = (
                        SELECT
                            at."accountTypeId"
                        FROM
                            ledger."accountType" at
                        WHERE
                            at."code" = 'ac'
                    );

                IF "@creditCommissionAccountId" IS NOT NULL THEN
                    UPDATE
                        ledger.account
                    SET
                        credit = credit + "@creditCommission"
                    WHERE
                        "accountId" = "@creditCommissionAccountId";

                    UPDATE
                        ledger.account
                    SET
                        debit = debit + "@creditCommission"
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
                        "@creditCommissionAccountId",
                        t."currencyId",
                        "@creditCommission",
                        t."transferId"
                    FROM
                        ledger.transfer t
                    WHERE
                        t."paymentId" = "@paymentId";
                END IF;
            END IF;

            IF ("@debitCommission" > 0) THEN
                SELECT
                    a."accountId"
                INTO
                    "@debitCommissionAccountId"
                FROM
                    ledger."account" a
                WHERE
                    a."accountTypeId" = (SELECT at."accountTypeId" FROM ledger."accountType" at WHERE at."code" = 'ac')
                    AND
                    a."parentId" = "@debitAccountId";

                IF "@debitCommissionAccountId" IS NOT NULL THEN
                    UPDATE
                        ledger.account
                    SET
                        credit = credit + "@debitCommission"
                    WHERE
                        "accountId" = "@debitCommissionAccountId";

                    UPDATE
                        ledger.account
                    SET
                        debit = debit + "@debitCommission"
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
                        "@debitCommissionAccountId",
                        t."currencyId",
                        "@debitCommission",
                        t."transferId"
                    FROM
                        ledger.transfer t
                    WHERE
                        t."paymentId" = "@paymentId";
                END IF;
            END IF;



            IF ("@creditFee" > 0) THEN
                UPDATE
                    ledger.account
                SET
                    debit = debit + "@creditFee"
                WHERE
                    "accountId" = "@creditAccountId";

                UPDATE
                    ledger.account
                SET
                    credit = credit + "@creditFee"
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
                    "@creditAccountId",
                    "@feeAccountId",
                    t."currencyId",
                    "@creditFee",
                    t."transferId"
                FROM
                    ledger.transfer t
                WHERE
                    t."paymentId" = "@paymentId";
            END IF;

            IF ("@debitFee" > 0) THEN
                UPDATE
                    ledger.account
                SET
                    debit = debit + "@debitFee"
                WHERE
                    "accountId" = "@debitAccountId";

                UPDATE
                    ledger.account
                SET
                    credit = credit + "@debitFee"
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
                    "@debitFee",
                    t."transferId"
                FROM
                    ledger.transfer t
                WHERE
                    t."paymentId" = "@paymentId";
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
                "paymentId" = "@paymentId";

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
              "paymentId" = "@paymentId";
        END IF;

        RETURN query
        SELECT
            *
        FROM
            ledger."transfer.get"("@paymentId");

    END
$body$ LANGUAGE plpgsql
