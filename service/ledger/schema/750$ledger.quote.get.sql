CREATE OR REPLACE FUNCTION ledger."quote.get"(
    "@paymentId" VARCHAR,
    "@isDebit" BOOLEAN
) RETURNS TABLE (
    "quoteId" BIGINT,
    "paymentId" VARCHAR(100),
    "identifier" character varying(256),
    "identifierType" varchar(3),
    "destinationAccount" varchar(100),
    "currencyId" character(3),
    "amount" NUMERIC(19,2),
    "fee" NUMERIC(19,2),
    "commission" NUMERIC(19,2),
    "transferTypeId" INTEGER,
    "isDebit" BOOLEAN,
    "expiresAt" TIMESTAMP,
    "transferType" VARCHAR(25),
    "isSingleResult" BOOLEAN
) AS
$BODY$
    BEGIN
        IF "@paymentId" IS NULL THEN
        RAISE EXCEPTION 'ledger.quotePaymentIdMissing';
        END IF;
        IF "@isDebit" IS NULL THEN
            RAISE EXCEPTION 'ledger.quoteIsDebitMissing';
        END IF;

        DELETE FROM
            ledger."quote" AS lq
        WHERE
            lq."expiresAt" < NOW()
            AND NOT EXISTS (SELECT 1 FROM ledger."transfer" lt WHERE lt."paymentId" = lq."paymentId");

        IF NOT EXISTS (SELECT 1 FROM ledger."quote" AS q WHERE q."paymentId" = "@paymentId" and q."isDebit" = "@isDebit") THEN
            RAISE EXCEPTION 'ledger.quoteNotFound';
        END IF;

        RETURN query
            SELECT
                q.*,
                tt."transferCode" AS "transferType",
                true as "isSingleResult"
            FROM
                ledger."quote" AS q
            JOIN
                ledger."transferType" AS tt
                ON q."transferTypeId" = tt."transferTypeId"
            WHERE
                q."paymentId" = "@paymentId" and q."isDebit" = "@isDebit";
    END;
$BODY$
LANGUAGE plpgsql
