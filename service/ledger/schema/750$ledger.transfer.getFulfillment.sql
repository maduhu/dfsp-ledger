CREATE OR REPLACE FUNCTION ledger."transfer.getFulfillment"("@uuid" character varying(100)
)
RETURNS character varying(100)

AS
$BODY$

  declare   "@fulfillment" character varying(100)=(select fulfillment from ledger.transfer where uuid="@uuid" );


BEGIN
	 return "@fulfillment";

 END
$BODY$
LANGUAGE plpgsql
	