﻿CREATE OR REPLACE FUNCTION ledger."transfer.hold"(
    "@uuid" character varying(100),
    "@debitAccount" character varying(20),
    "@debitMemo" json,
    "@creditAccount"  character varying(20),
    "@creditMemo"  json,
    "@amount"  numeric(19,2),
    "@executionCondition"  character varying(100),
    "@cancellationCondition"  character varying(100),
    "@state"  character varying(20),
    "@expiresAt"  timestamp,
    "@transferTypeId" integer
) RETURNS TABLE(
    id character varying(100),
    "debitAccount" character varying(20),
    "debitMemo" json,
    "creditAccount" character varying(20),
    "creditMemo" json,
    amount numeric(19,2),
    "executionCondition" character varying(100),
    "cancellationCondition"  character varying(100),
    "state"  character varying(20),
    "expiresAt"  timestamp
) AS
$BODY$
    DECLARE
        "@debitAccountId" int;
        "@creditAccountId" int;
        "@creditBalance" numeric(19,2);
        "@currencyId" char(3);
        "@transferStateId" int:=(SELECT ts."transferStateId" FROM ledger."transferState" ts WHERE ts.name="@state");
        "@transferId" BIGINT:=(SELECT nextval('ledger."transfer_transferId_seq"'));

    BEGIN
        IF (SELECT COUNT(*) FROM ledger.transfer WHERE uuid = "@uuid") > 0 THEN
            RAISE EXCEPTION 'ledger.alreadyExists';
        END IF;

        SELECT
            a."accountId",a."currencyId"
        INTO
            "@debitAccountId","@currencyId"
        FROM
            ledger.account a
        WHERE
            a."accountNumber"="@debitAccount";

        SELECT
            a."accountId",a.credit-a.debit
        INTO
            "@creditAccountId","@creditBalance"
        FROM
            ledger.account a
        WHERE
            a."accountNumber"="@creditAccount" ;

        IF "@creditBalance"<"@amount" THEN
            RAISE EXCEPTION 'ledger.insufficientFunds';
        END IF;
        IF "@debitAccountId" IS NULL THEN
            RAISE EXCEPTION 'ledger.debitAccountNotFound';
        END IF;
        IF "@creditAccountId" IS NULL THEN
            RAISE EXCEPTION 'ledger.creditAccountNotFound';
        END IF;

        INSERT INTO
            ledger.transfer(
                "transferId",
                "uuid",
                "transferDate",
                "transferTypeId",
                "debitAccountId",
                "debitMemo",
                "creditAccountId",
                "creditMemo",
                "currencyId",
                amount,
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
             "@debitMemo",
             "@creditAccountId",
             "@creditMemo",
             "@currencyId",
            "@amount",
            "@executionCondition",
            "@cancellationCondition",
             "@transferStateId",
            "@expiresAt",
            now(),
            now(),
            now()
        );

        RETURN QUERY
        SELECT
            t."uuid" AS id,
            debit."accountNumber" AS "debitAccount",
            t."debitMemo",
            credit."accountNumber" AS "creditAccount",
            t."creditMemo",
            t.amount,
            t."executionCondition",
            t."cancellationCondition",
            ts.name state,
            t."expiresAt"
        FROM
            ledger.transfer AS t
        JOIN
            ledger.account AS debit ON t."debitAccountId" = debit."accountId"
        JOIN
            ledger.account AS credit ON t."creditAccountId" = credit."accountId"
        JOIN
            ledger."transferState" ts ON ts."transferStateId"=t."transferStateId"
        WHERE
            t."transferId" ="@transferId";
    END
$BODY$ LANGUAGE plpgsql
