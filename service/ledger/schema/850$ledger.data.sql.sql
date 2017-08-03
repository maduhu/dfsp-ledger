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
  (6, 'cash out','cashOut'),
  (7, 'unknown','unknown')
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
  (5, 'agentCommission','ac'),
  (6, 'connector', 'con')
ON CONFLICT ("accountTypeId") DO UPDATE SET
  "name" = EXCLUDED."name",
  "code" = EXCLUDED."code";

-- account
INSERT INTO
  ledger."account" ("name", "accountNumber", "credit", "debit", "accountTypeId", "isDisabled", "parentId", "creationDate", "currencyId")
VALUES
  ('settlement', '000000001', 1000000, 0, 2, FALSE, NULL, '2016-08-24 10:24:45.845802', 'TZS'),
  ('fee', '000000002', 1000000, 0, 3, FALSE, NULL, '2016-08-24 10:24:45.845802', 'TZS'),
  ('commission', '000000003', 100000000, 0, 4, FALSE, NULL, '2016-08-24 10:24:45.845802', 'TZS'),
  ('testAccount1', '000000011', 1000000, 1000, 1, FALSE, NULL, '2016-08-24 10:24:45.845802', 'TZS'),
  ('testAccount2', '000000012', 1000000, 1000, 1, FALSE, NULL, '2016-08-24 10:24:45.845802', 'TZS'),
  ('testAccount3', '000000013', 1000000, 1000, 1, FALSE, NULL, '2016-08-24 10:24:45.845802', 'TZS'),
  ('testAccount4', '000000014', 1000000, 1000, 1, FALSE, NULL, '2016-08-24 10:24:45.845802', 'TZS')
ON CONFLICT ("accountNumber") DO UPDATE SET
  "name" = EXCLUDED."name",
  "credit" = EXCLUDED."credit",
  "debit" = EXCLUDED."debit",
  "accountTypeId" = EXCLUDED."accountTypeId",
  "isDisabled" = EXCLUDED."isDisabled",
  "parentId" = EXCLUDED."parentId",
  "creationDate" = EXCLUDED."creationDate",
  "currencyId" = EXCLUDED."currencyId";
