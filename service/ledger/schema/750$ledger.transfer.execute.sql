CREATE OR REPLACE FUNCTION ledger."transfer.execute"("@transferId" character varying
,"@condition" character varying
,"@fulfillment" character varying(100))
RETURNS
    TABLE(fulfillment character varying(100))
AS
$BODY$
	  declare
      	"@executionCondition" character varying(100);
      	"@cancellationCondition" character varying(100);
        "@debitAccountId" int;
       	"@creditAccountId" int;
        "@creditBalance" money;
        "@amount" money;
        "@transferStateId" int;

	BEGIN
	SELECT t."executionCondition"
		,t."cancellationCondition"
		,t."debitAccountId"
		,t."creditAccountId"
		,t."transferStateId"
	INTO "@executionCondition"
		,"@cancellationCondition"
		,"@debitAccountId"
		,"@creditAccountId"
		,"@transferStateId"
	FROM ledger.transfer t
	WHERE t."uuid" = "@transferId";

	SELECT a.credit - a.debit
	INTO "@creditBalance"
	FROM ledger.account a
	WHERE a."accountId" = "@creditAccountId";

	IF (
			"@transferStateId" != (
				SELECT "transferStateId"
				FROM ledger."transferState"
				WHERE NAME = 'prepared'
				)
			) THEN RAISE EXCEPTION 'ledger.transferIsProcessedAlready';
    END	IF ;
    IF ("@condition" = "@cancellationCondition") THEN
        UPDATE ledger.transfer
        SET "transferStateId" = (
                SELECT "transferStateId"
                FROM ledger."transferState" ts
                WHERE ts.NAME = 'rejected'
                )
            ,fulfillment = "@fulfillment"
        WHERE "uuid" = "@transferId";
	END IF ;
	IF ("@condition" = "@executionCondition") THEN
		IF "@creditBalance" < "@amount" THEN
        	RAISE EXCEPTION 'ledger.insufficientFunds';
        END IF ;
        UPDATE ledger.account
        SET debit = debit + "@amount"
        WHERE "accountId" = "@debitAccountId";

        UPDATE ledger.account
        SET credit = credit + "@amount"
        WHERE "accountId" = "@creditAccountId";

        UPDATE ledger.transfer
        SET "transferStateId" = (
                SELECT "transferStateId"
                FROM ledger."transferState" ts
                WHERE ts.NAME = 'executed'
                )
            ,fulfillment = "@fulfillment"
        WHERE "uuid" = "@transferId";
    END IF ;
	RETURN QUERY
    SELECT t.fulfillment
    FROM ledger.transfer AS t
    WHERE t."uuid" = "@transferId";
END
$BODY$
LANGUAGE plpgsql
