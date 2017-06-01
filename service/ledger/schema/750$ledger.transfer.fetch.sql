CREATE OR REPLACE FUNCTION ledger."transfer.fetch"(
    "@transferType" character varying(100),
    "@identifier" character varying(256),
    "@identifierType" character varying(3),
    "@isDebit" boolean,
    "@currency" varchar(3)
) RETURNS TABLE (
    "amountDaily" numeric(19,2),
    "countDaily" integer,
    "amountWeekly" numeric(19,2),
    "countWeekly" integer,
    "amountMonthly" numeric(19,2),
    "countMonthly" integer,
    "totalAmount" numeric(19,2),
    "totalCount" integer,
    "isSingleResult" boolean
) AS
$BODY$
    DECLARE
        "@date" timestamp without time zone := NOW();
        "@dayStart" timestamp without time zone := date_trunc('day', "@date");
        "@weekStart" timestamp without time zone := date_trunc('week', "@date");
        "@monthStart" timestamp without time zone := date_trunc('month', "@date");
        "@transferTypeId" integer := (
            SELECT
                tt."transferTypeId"
            FROM
                ledger."transferType" tt
            WHERE
                tt."transferCode" = "@transferType"
        );
    BEGIN
      RETURN query
      SELECT
        COALESCE(SUM(CASE WHEN t."executedAt" >= "@dayStart" THEN t."amount" END), 0)::numeric(19,2) "amountDaily",
        COALESCE(COUNT(CASE WHEN t."executedAt" >= "@dayStart" THEN t."amount" END), 0)::integer "countDaily",
        COALESCE(SUM(CASE WHEN t."executedAt" >= "@weekStart" THEN t."amount" END), 0)::numeric(19,2) "amountWeekly",
        COALESCE(COUNT(CASE WHEN t."executedAt" >= "@weekStart" THEN t."amount" END), 0)::integer "countWeekly",
        COALESCE(SUM(CASE WHEN t."executedAt" >= "@monthStart" THEN t."amount" END), 0)::numeric(19,2) "amountMonthly",
        COALESCE(COUNT(CASE WHEN t."executedAt" >= "@monthStart" THEN t."amount" END), 0)::integer "countMonthly",
        COALESCE(SUM(t."amount"), 0)::numeric(19,2) "totalAmount",
        COALESCE(COUNT(t."amount"), 0)::integer "totalCount",
        true "isSingleResult"
      FROM
        ledger.transfer t
      WHERE
        t."currencyId" = COALESCE("@currency", 'USD')
        AND t."transferTypeId" = "@transferTypeId"
        AND CASE WHEN ("@isDebit" = TRUE)
                THEN t."debitIdentifier" = "@identifier" AND t."debitIdentifierType" = "@identifierType"
                ELSE t."creditIdentifier" = "@identifier" AND t."creditIdentifierType" = "@identifierType"
            END;
    END
$BODY$ LANGUAGE plpgsql
