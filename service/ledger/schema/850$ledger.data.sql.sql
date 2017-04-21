-- transfer state
INSERT INTO
  ledger."transferState" ("transferStateId", "name","transferStateCode")
VALUES
  (1, 'proposed','pro'),
  (2, 'prepared','pre'),
  (3, 'cancelled','can'),
  (4, 'executed','exe')
ON CONFLICT ("transferStateId") DO UPDATE SET
  "name" = EXCLUDED."name",
  "transferStateCode" = EXCLUDED."transferStateCode";

INSERT INTO
  ledger."transferState" ("transferStateId", name,"transferStateCode")
SELECT
  5, 'rejected','rej'
WHERE
  NOT EXISTS (SELECT 1 FROM ledger."transferState" WHERE name='rejected');

-- transfer type
INSERT INTO
  ledger."transferType" ("transferTypeId", "name", "transferCode")
VALUES
  (1, 'person to person','p2p'),
  (2, 'invoice','invoice'),
  (3, 'fee','fee'),
  (4, 'bulk payment','bulkPayment'),
  (5, 'cash in','cashIn'),
  (6, 'cash out','cashOut')
ON CONFLICT ("transferTypeId") DO UPDATE SET
  "name" = EXCLUDED."name",
  "transferCode" = EXCLUDED."transferCode";

-- currency
INSERT INTO
  ledger."currency" ("currencyId", "name", "symbol")
VALUES
  ('USD', 'US Dollar', '$'),
  ('CNY', ' Chinese Yuan Renminbi', '¥'),
  ('TZS', ' Tanzanian shilling', 'TSh')
ON CONFLICT ("currencyId") DO UPDATE SET
  "name" = EXCLUDED."name",
  "symbol" = EXCLUDED."symbol";

-- accountType
INSERT INTO
  ledger."accountType" ("accountTypeId", "name", "code")
VALUES
  (1, 'mWallet','mw'),
  (2, 'settlement','s'),
  (3, 'fee','f'),
  (4, 'commission','c'),
  (5, 'agentCommission','ac')
ON CONFLICT ("accountTypeId") DO UPDATE SET
  "name" = EXCLUDED."name",
  "code" = EXCLUDED."code";

-- account
INSERT INTO
  ledger."account" ("name", "accountNumber", "credit", "debit", "accountTypeId", "isDisabled", "parentId", "creationDate", "currencyId")
VALUES
  ('settlement', '000000001', 10000, 0, 2, FALSE, NULL, '2016-08-24 10:24:45.845802', 'USD'),
  ('fee', '000000002', 10000, 0, 3, FALSE, NULL, '2016-08-24 10:24:45.845802', 'USD'),
  ('commission', '000000003', 1000000, 0, 4, FALSE, NULL, '2016-08-24 10:24:45.845802', 'USD'),
  ('testAccount1', '000000011', 10000, 1000, 1, FALSE, NULL, '2016-08-24 10:24:45.845802', 'USD'),
  ('testAccount2', '000000012', 10000, 1000, 1, FALSE, NULL, '2016-08-24 10:24:45.845802', 'USD'),
  ('testAccount3', '000000013', 10000, 1000, 1, FALSE, NULL, '2016-08-24 10:24:45.845802', 'USD'),
  ('testAccount4', '000000014', 10000, 1000, 1, FALSE, NULL, '2016-08-24 10:24:45.845802', 'USD')
ON CONFLICT ("accountNumber") DO UPDATE SET
  "name" = EXCLUDED."name",
  "credit" = EXCLUDED."credit",
  "debit" = EXCLUDED."debit",
  "accountTypeId" = EXCLUDED."accountTypeId",
  "isDisabled" = EXCLUDED."isDisabled",
  "parentId" = EXCLUDED."parentId",
  "creationDate" = EXCLUDED."creationDate",
  "currencyId" = EXCLUDED."currencyId";
