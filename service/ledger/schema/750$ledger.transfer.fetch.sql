CREATE OR REPLACE FUNCTION ledger."transfer.fetch"(
    "@transferType" character varying(100),
    "@accountNumber" character varying(100),
    "@currency" varchar(3)
) RETURNS TABLE (
    "amountDaily" numeric(19,2),
    "countDaily" integer,
    "amountWeekly" numeric(19,2),
    "countWeekly" integer,
    "amountMonthly" numeric(19,2),
    "countMonthly" integer,
    "isSingleResult" boolean
) AS
$BODY$
    DECLARE
        "@date" timestamp without time zone := NOW();
        "@dayStart" timestamp without time zone := date_trunc('day', "@date");
        "@weekStart" timestamp without time zone := date_trunc('week', "@date");
        "@transferTypeId" integer := (
            SELECT
                tt."transferTypeId"
            FROM
                ledger."transferType" tt
            WHERE
                tt."name" = "@transferType"
        );
        "@debitAccountId" integer := (
            SELECT
                a."accountId"
            FROM
                ledger."account" a
            WHERE
                a."accountNumber" = "@accountNumber"
        );
    BEGIN
      RETURN query
      SELECT
        COALESCE(SUM(CASE WHEN "executedAt" >= "@dayStart" THEN "amount" END), 0)::numeric(19,2) "amountDaily",
        COALESCE(COUNT(CASE WHEN "executedAt" >= "@dayStart" THEN "amount" END), 0)::integer "countDaily",
        COALESCE(SUM(CASE WHEN "executedAt" >= "@weekStart" THEN "amount" END), 0)::numeric(19,2) "amountWeekly",
        COALESCE(COUNT(CASE WHEN "executedAt" >= "@weekStart" THEN "amount" END), 0)::integer "countWeekly",
        COALESCE(SUM(amount), 0)::numeric(19,2) "amountMonthly",
        COALESCE(COUNT(amount), 0)::integer "countMonthly",
        true "isSingleResult"
      FROM
        ledger.transfer
      WHERE
        "currencyId" = COALESCE("@currency", 'USD')
        AND "transferTypeId" = "@transferTypeId"
        AND "debitAccountId" = "@debitAccountId"
        AND "executedAt" >= date_trunc('month', "@date");
    END
$BODY$ LANGUAGE plpgsql
