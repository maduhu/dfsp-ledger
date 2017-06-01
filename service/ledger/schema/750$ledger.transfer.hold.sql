﻿CREATE OR REPLACE FUNCTION ledger."transfer.hold"(
    "@uuid" character varying(100),
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
    "id" character varying(100),
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
        "@creditIdentifier" varchar(256);
        "@creditIdentifierType" varchar(3);
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
        IF EXISTS (SELECT 1 FROM ledger.transfer WHERE uuid = "@uuid") THEN
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
                ledger."quote.get"("@uuid", true) dq
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
                cq."identifier",
                cq."identifierType",
                cq."fee"
            FROM
                ledger."quote.get"("@uuid", false) cq
            INTO
                "@transferTypeId",
                "@creditIdentifier",
                "@creditIdentifierType",
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
                "uuid",
                "transferDate",
                "transferTypeId",
                "debitAccountId",
                "debitIdentifier",
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
            "@uuid",
            NOW(),
            "@transferTypeId",
            "@debitAccountId",
            "@debitIdentifier",
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
                ledger."transfer.execute"("@uuid", '', '');
        ELSE
            RETURN query
            SELECT
                *
            FROM
                ledger."transfer.get"("@uuid");
        END IF;
    END
$BODY$ LANGUAGE plpgsql
