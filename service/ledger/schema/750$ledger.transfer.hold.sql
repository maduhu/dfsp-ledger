CREATE OR REPLACE FUNCTION ledger."transfer.hold"("@uuid" character varying(100)
,"@debitAccount" character varying(20)
,"@creditAccount"  character varying(20)
,"@amount"  money
,"@executionCondition"  character varying(100)
,"@cancellationCondition"  character varying(100)
,"@state"  character varying(20)
,"@expiresAt"  timestamp
,"@transferTypeId" integer

)
RETURNS
    TABLE(id character varying(100)
    , "debitAccount" character varying(20)
    , "creditAccount" character varying(20)
    , amount money
    ,"executionCondition" character varying(100)
    ,"cancellationCondition"  character varying(100)
    ,"state"  character varying(20)
    ,"expiresAt"  timestamp
   )
AS
$BODY$

  declare   "@debitAccountId" int;
             "@creditAccountId" int;
             "@creditBalance" money;
             "@currencyId" char(3);
             "@transferStateId" int:=( SELECT  ts."transferStateId"  from ledger."transferState" ts where ts.name="@state");
             "@transferId" BIGINT:=(SELECT nextval('ledger."transfer_transferId_seq"'));


BEGIN
	SELECT a."accountId",a."currencyId" into "@debitAccountId","@currencyId"  from ledger.account a where a."accountNumber"="@debitAccount";
	SELECT a."accountId",a.credit-a.debit into "@creditAccountId","@creditBalance"   from ledger.account a where a."accountNumber"="@creditAccount" ;

    IF "@creditBalance"<"@amount" THEN
   		RAISE EXCEPTION 'ledger.insufficientFunds';
  	END IF;
    IF "@debitAccountId" IS NULL THEN
   		RAISE EXCEPTION 'ledger.debitAccountDoes''tExists';
  	END IF;
    IF "@creditAccountId" IS NULL THEN
   		RAISE EXCEPTION 'ledger.creditAccountDoes''tExists';
  	END IF;



	  INSERT INTO
              ledger.transfer
              (
              "transferId",
              "uuid",
              "transferDate",
              "transferTypeId",
              "debitAccountId",
              "creditAccountId",
              "currencyId",
              amount,
              "executionCondition",
              "cancellationCondition",
              "transferStateId",
              "expiresAt",
              "creationDate"
              )
     VALUES("@transferId"
     		,"@uuid"
            ,NOW()
            ,"@transferTypeId"
            , "@debitAccountId"
            , "@creditAccountId"
            , "@currencyId"
            ,"@amount"
            ,"@executionCondition"
            ,"@cancellationCondition"
            , "@transferStateId"
            ,"@expiresAt"
            ,now()
            );




  return QUERY
    SELECT
        t."uuid" as id,
        debit."accountNumber" as "debitAccount",
        credit."accountNumber" as "creditAccount",
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
    	ledger."transferState" ts on ts."transferStateId"=t."transferStateId"
        where t."transferId" ="@transferId" ;

 END
$BODY$
LANGUAGE plpgsql
	