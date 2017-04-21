CREATE OR REPLACE FUNCTION ledger."ministatement.get"(
    "@accountNumber" varchar(50)
) RETURNS TABLE (
    "name" text,
    "amount" text,
    "date" timestamp without time zone
) AS
$BODY$
    DECLARE "@accountId" bigint:=(SELECT "accountId" FROM ledger."account" WHERE "accountNumber" = "@accountNumber");
    BEGIN
        RETURN query
        SELECT
            CASE WHEN t."debitAccountId" = "@accountId"
                THEN CAST(t."creditMemo"->'ilp_header'->'data'->'data'->>'memo' AS json)->>'creditName'
                ELSE CAST(t."creditMemo"->'ilp_header'->'data'->'data'->>'memo' AS json)->>'debitName'
            END AS "name",
            CONCAT(CASE WHEN t."debitAccountId" = "@accountId" THEN '-' ELSE '' END, CAST(t."amount" AS varchar)) AS "amount",
            t."transferDate" AS "date"
        FROM
            ledger.transfer t
        WHERE
            t."debitAccountId" = "@accountId" OR t."creditAccountId" = "@accountId"
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
        ORDER BY "date" DESC;
    END
$BODY$
LANGUAGE plpgsql
