CREATE OR REPLACE FUNCTION ledger."ministatement.get"(
    "@accountNumber" varchar(50)
) RETURNS TABLE (
    "name" varchar,
    "amount" text,
    "date" timestamp without time zone
) AS
$BODY$
    DECLARE "@accountId" bigint:=(
        SELECT
            "accountId"
        FROM
            ledger."account"
        WHERE
            "accountNumber" = "@accountNumber"
    );
    BEGIN
        RETURN query
        SELECT m.* FROM (
            SELECT
                COALESCE(q1.identifier, 'unknown') AS "name",
                CONCAT('-', CAST(t1."amount" AS varchar)) AS "amount",
                t1."transferDate" AS "date"
            FROM
                ledger.transfer t1
            LEFT JOIN
                ledger.quote q1 ON t1."paymentId" = q1."paymentId" AND q1."isDebit" = false
            WHERE
                t1."debitAccountId" = "@accountId"
            UNION ALL
            SELECT
                COALESCE(q2.identifier, 'unknown') AS "name",
                CAST(t2."amount" AS varchar) AS "amount",
                t2."transferDate" AS "date"
            FROM
                ledger.transfer t2
            LEFT JOIN
                ledger.quote q2 ON t2."paymentId" = q2."paymentId" AND q2."isDebit" = true
            WHERE
                t2."creditAccountId" = "@accountId"
            UNION ALL
            SELECT
                'fee' AS "name",
                CONCAT('-', CAST(f."amount" AS varchar)) AS "amount",
                f."transferDate" AS "date"
            FROM
                ledger.fee f
            WHERE
                f."debitAccountId" = "@accountId"
            UNION ALL
            SELECT
                'commission' AS "name",
                CAST(c."amount" AS varchar) AS "amount",
                c."transferDate" AS "date"
            FROM
                ledger.commission c
            WHERE
                c."creditAccountId" = "@accountId"
        ) as m
        ORDER BY m."date" DESC
        LIMIT 10;
    END
$BODY$
LANGUAGE plpgsql
