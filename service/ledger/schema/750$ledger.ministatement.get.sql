CREATE OR REPLACE FUNCTION ledger."transfer.get"(
	"@accountId" character varying(100)
) RETURNS TABLE (
	"name" varchar(100),
	"amount" varchar(20),
	"date" timestamp without time zone
) AS
$BODY$
	SELECT
		CASE WHEN "debitAccountId" = "@accountId"
			THEN CAST("creditMemo"->'ilp_header'->'data'->'data'->>'memo' AS json)->>'creditName'
			ELSE CAST("creditMemo"->'ilp_header'->'data'->'data'->>'memo' AS json)->>'debitName'
		END AS "name",
		CONCAT(CASE WHEN "debitAccountId" = "@accountId" THEN '-' ELSE '' END, CAST("amount" AS varchar)) AS "amount",
		"transferDate" AS "date"
	FROM
		ledger.transfer
	WHERE
		"debitAccountId" = "@accountId" OR "creditAccountId" = "@accountId"
	UNION ALL
	SELECT
		'fee' AS "name",
		CONCAT('-', CAST("amount" AS varchar)) AS "amount",
		"transferDate" AS "date"
	FROM
		ledger.fee
	WHERE
		"debitAccountId" = "@accountId"
	ORDER BY "date" DESC
$BODY$
LANGUAGE SQL
