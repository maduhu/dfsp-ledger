CREATE OR replace FUNCTION ledger."transfer.reject"(
    "@paymentId" CHARACTER varying,
    "@reason" CHARACTER varying
) RETURNS TABLE (
    "paymentId" character varying(100),
    "debitAccount" character varying(20),
    "debitMemo" json,
    "creditAccount" character varying(20),
    "creditMemo" json,
    "amount" numeric(19,2),
    "executionCondition" character varying(100),
    "cancellationCondition" character varying(100),
    "state" character varying(25),
    "expiresAt" timestamp,
    "creationDate" timestamp,
    "proposedAt" timestamp,
    "preparedAt" timestamp,
    "executedAt"timestamp,
    "rejectedAt" timestamp,
    "fulfillment" character varying(100)
) AS
$body$
    #variable_conflict use_column
    DECLARE
        "@transferStateId" INT;
    BEGIN
        SELECT
            t."transferStateId"
        INTO
            "@transferStateId"
        FROM
            ledger.transfer t
        WHERE
            t."paymentId" = "@paymentId";

        IF ("@transferStateId" != (
              SELECT "transferStateId"
              FROM   ledger."transferState"
              WHERE  name = 'prepared'
            )
        )
        THEN
            RAISE EXCEPTION 'ledger.transfer.reject.alreadyExists';
        END IF;

        UPDATE
            ledger.transfer
        SET
            "transferStateId" = (
                SELECT "transferStateId"
                FROM   ledger."transferState" ts
                WHERE  ts.name = 'rejected' ) ,
            "description" = "@reason",
            "rejectedAt"=NOW()
        WHERE
            "paymentId" = "@paymentId";

        RETURN query
        SELECT
            *
        FROM
            ledger."transfer.get"("@paymentId");

    END
$body$ LANGUAGE plpgsql