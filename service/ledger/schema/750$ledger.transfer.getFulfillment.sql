CREATE OR REPLACE FUNCTION ledger."transfer.getFulfillment"("@paymentId" character varying(100)
)
RETURNS character varying(100)

AS
$BODY$
  declare "@fulfillment" character varying(100)=(select fulfillment from ledger.transfer t where t."paymentId"="@paymentId" );

  BEGIN
    return "@fulfillment";
  END
$BODY$
LANGUAGE plpgsql
