CREATE OR REPLACE FUNCTION ledger."transfer.hold"(
    "@paymentId" character varying(100),
    "@debitAccount" character varying(20),
    "@debitMemo" json,
    "@creditAccount" character varying(20),
    "@creditMemo" json,
    "@amount" numeric(19,2),
    "@executionCondition" character varying(100),
    "@cancellationCondition" character varying(100),
    "@authorized" boolean,
    "@expiresAt" timestamp
) RETURNS TABLE(
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
$BODY$
    DECLARE
        -- debit
        "@debitAccountId" int;
        "@debitBalance" numeric(19,2);
        "@debitIdentifier" varchar(256);
        "@debitIdentifierType" varchar(3);
        "@debitFee" numeric(19,2):=0;
        -- credit
        "@creditAccountId" int;
        "@creditBalance" numeric(19,2);
        "@creditFee" numeric(19,2):=0;
        -- common
        "@currencyId" char(3);
        "@transferTypeId" int;
        "@transferId" bigint:=(SELECT nextval('ledger."transfer_transferId_seq"'));
        "@transferStateId" int:=(
            SELECT
                ts."transferStateId"
            FROM
                ledger."transferState" ts
            WHERE
                ts.name = (CASE "@authorized" WHEN true THEN 'prepared' ELSE 'proposed' END)
        );
    BEGIN
        IF EXISTS (SELECT 1 FROM ledger.transfer t WHERE t."paymentId" = "@paymentId") THEN
            RAISE EXCEPTION 'ledger.transfer.hold.alreadyExists';
        END IF;
        -- debit details
        SELECT
            a."accountId",
            a."credit" - a."debit",
            a."currencyId"
        INTO
            "@debitAccountId",
            "@debitBalance",
            "@currencyId"
        FROM
            ledger.account a
        WHERE
            a."accountNumber" = "@debitAccount";
        -- credit details
        SELECT
            a."accountId",
            a."credit" - a."debit"
        INTO
            "@creditAccountId",
            "@creditBalance"
        FROM
            ledger.account a
        WHERE
            a."accountNumber" = "@creditAccount";
        -- extract quotes
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
                dq."transferTypeId",
                dq."identifier",
                dq."identifierType",
                dq."fee"
            FROM
                ledger."quote.get"("@paymentId", true) dq
            INTO
                "@transferTypeId",
                "@debitIdentifier",
                "@debitIdentifierType",
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
                cq."transferTypeId",
                cq."fee"
            FROM
                ledger."quote.add"(
                    CAST("@creditMemo"->'quote'->>'paymentId' AS character varying(100)),
                    CAST("@creditMemo"->'quote'->>'identifier' AS character varying(25)),
                    CAST("@creditMemo"->'quote'->>'identifierType' AS varchar(3)),
                    CAST("@creditMemo"->'quote'->>'destinationAccount' AS varchar(100)),
                    null,
                    CAST("@creditMemo"->'quote'->>'currency' AS character(3)),
                    CAST("@creditMemo"->'quote'->>'amount' AS numeric(19,2)),
                    CAST("@creditMemo"->'quote'->>'fee' AS numeric(19,2)),
                    CAST("@creditMemo"->'quote'->>'commission' AS numeric(19,2)),
                    CAST("@creditMemo"->'quote'->>'transferType' AS character varying(25)),
                    null,
                    null,
                    null,
                    CAST("@creditMemo"->'quote'->>'isDebit' AS boolean),
                    CAST("@creditMemo"->'quote'->>'expiresAt' AS timestamp),
                    CAST("@creditMemo"->'quote'->>'params' AS json)
                 ) cq
            INTO
                "@transferTypeId",
                "@creditFee";
        END IF;
        -- perform checks
        IF "@transferTypeId" IS NULL THEN
            RAISE EXCEPTION 'ledger.transfer.hold.unknownTransferType';
        END IF;
        IF "@debitBalance" < ("@amount" + "@debitFee") THEN
            RAISE EXCEPTION 'ledger.transfer.hold.insufficientFunds';
        END IF;
        IF "@creditBalance" + "@amount" < "@creditFee" THEN
            RAISE EXCEPTION 'ledger.transfer.hold.insufficientFunds';
        END IF;
        IF "@debitAccountId" IS NULL THEN
            RAISE EXCEPTION 'ledger.transfer.hold.debitAccountNotFound';
        END IF;
        IF "@creditAccountId" IS NULL THEN
            RAISE EXCEPTION 'ledger.transfer.hold.creditAccountNotFound';
        END IF;
        -- insert transfer
        INSERT INTO
            ledger.transfer(
                "transferId",
                "paymentId",
                "transferDate",
                "transferTypeId",
                "debitAccountId",
                "debitIdentifier",
                "debitIdentifierType",
                "debitMemo",
                "creditAccountId",
                "creditMemo",
                "currencyId",
                "amount",
                "executionCondition",
                "cancellationCondition",
                "transferStateId",
                "expiresAt",
                "creationDate",
                "proposedAt",
                "preparedAt"
            )
        VALUES (
            "@transferId",
            "@paymentId",
            NOW(),
            "@transferTypeId",
            "@debitAccountId",
            "@debitIdentifier",
            "@debitIdentifierType",
            "@debitMemo",
            "@creditAccountId",
            "@creditMemo",
            "@currencyId",
            "@amount",
            coalesce("@executionCondition", ''),
            "@cancellationCondition",
            "@transferStateId",
            "@expiresAt",
            now(),
            now(),
            now()
        );

        IF ("@authorized" AND "@executionCondition" IS NULL) THEN -- execute unconditionally
            RETURN query
            SELECT
                *
            FROM
                ledger."transfer.execute"("@paymentId", '', '');
        ELSE
            RETURN query
            SELECT
                *
            FROM
                ledger."transfer.get"("@paymentId");
        END IF;
    END
$BODY$ LANGUAGE plpgsql;
