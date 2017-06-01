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
                q1.identifier AS "name",
                CONCAT('-', CAST(t1."amount" AS varchar)) AS "amount",
                t1."transferDate" AS "date"
            FROM
                ledger.transfer t1
            JOIN
                ledger.quote q1 ON t1."uuid" = q1."uuid"
            WHERE
                t1."debitAccountId" = "@accountId"
                AND q1."isDebit" = false
            UNION ALL
            SELECT
                q2.identifier AS "name",
                CAST(t2."amount" AS varchar) AS "amount",
                t2."transferDate" AS "date"
            FROM
                ledger.transfer t2
            JOIN
                ledger.quote q2 ON t2."uuid" = q2."uuid"
            WHERE
                t2."creditAccountId" = "@accountId"
                AND q2."isDebit" = true
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
