CREATE OR REPLACE FUNCTION ledger."quote.get"(
    "@uuid" VARCHAR,
    "@isDebit" BOOLEAN
) RETURNS TABLE (
    "quoteId" BIGINT,
    "uuid" VARCHAR(100),
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
    "isSingleResult" BOOLEAN
) AS
$BODY$
    BEGIN
        IF "@uuid" IS NULL THEN
        RAISE EXCEPTION 'ledger.quoteUuidMissing';
        END IF;
        IF "@isDebit" IS NULL THEN
            RAISE EXCEPTION 'ledger.quoteIsDebitMissing';
        END IF;

        DELETE FROM
            ledger."quote" AS lq
        WHERE
            lq."expiresAt" < NOW();

        IF NOT EXISTS (SELECT 1 FROM ledger."quote" AS q WHERE q."uuid" = "@uuid" and q."isDebit" = "@isDebit") THEN
            RAISE EXCEPTION 'ledger.quoteNotFound';
        END IF;

        RETURN query
            SELECT
                q.*,
                true as "isSingleResult"
            FROM
                ledger."quote" AS q
            WHERE
                q."uuid" = "@uuid" and q."isDebit" = "@isDebit";
    END;
$BODY$
LANGUAGE plpgsql
