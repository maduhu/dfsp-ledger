-- transfer state
INSERT INTO
  ledger."transferState" ("transferStateId", name,"transferStateCode")
SELECT
  1, 'proposed','pro'
WHERE
  NOT EXISTS (SELECT 1 FROM ledger."transferState" WHERE name='proposed');

INSERT INTO
  ledger."transferState" ("transferStateId", name,"transferStateCode")
SELECT
  2, 'prepared','pre'
WHERE
  NOT EXISTS (SELECT 1 FROM ledger."transferState" WHERE name='prepared');

INSERT INTO
  ledger."transferState" ("transferStateId", name,"transferStateCode")
SELECT
  3, 'cancelled','can'
WHERE
  NOT EXISTS (SELECT 1 FROM ledger."transferState" WHERE name='cancelled');

INSERT INTO
  ledger."transferState" ("transferStateId", name,"transferStateCode")
SELECT
  4, 'executed','exe'
WHERE
  NOT EXISTS (SELECT 1 FROM ledger."transferState" WHERE name='executed');

INSERT INTO
  ledger."transferState" ("transferStateId", name,"transferStateCode")
SELECT
  5, 'rejected','rej'
WHERE
  NOT EXISTS (SELECT 1 FROM ledger."transferState" WHERE name='rejected');

-- transfer type
INSERT INTO
  ledger."transferType"( "transferTypeId", name, "transferCode")
SELECT
  1, 'person to person','p2p'
WHERE
  NOT EXISTS (SELECT 1 FROM ledger."transferType" WHERE "transferCode"='p2p');

INSERT INTO
  ledger."transferType"( "transferTypeId", name, "transferCode")
SELECT
  2, 'invoice','invoice'
WHERE
  NOT EXISTS (SELECT 1 FROM ledger."transferType" WHERE "transferCode"='invoice');

INSERT INTO
  ledger."transferType"( "transferTypeId", name, "transferCode")
SELECT
 3, 'fee','fee'
WHERE
  NOT EXISTS (SELECT 1 FROM ledger."transferType" WHERE "transferCode"='fee');

INSERT INTO
  ledger."transferType"( "transferTypeId", name, "transferCode")
SELECT
  4, 'bulk payment','bulkPayment'
WHERE
  NOT EXISTS (SELECT 1 FROM ledger."transferType" WHERE "transferCode"='bulkPayment');

-- currency
INSERT INTO
  ledger."currency"("currencyId", "name", "symbol")
SELECT
  'USD', 'US Dollar', '$'
WHERE
  NOT EXISTS (SELECT 1 FROM ledger.currency WHERE "currencyId"='USD');

INSERT INTO
  ledger."currency"("currencyId", "name", "symbol")
SELECT
  'CNY', ' Chinese Yuan Renminbi', '¥'
WHERE
  NOT EXISTS (SELECT 1 FROM ledger.currency WHERE "currencyId"='CNY');

INSERT INTO
  ledger."currency"("currencyId", "name", "symbol")
SELECT
  'TZS', ' Tanzanian shilling', 'TSh'
WHERE
  NOT EXISTS (SELECT 1 FROM ledger.currency WHERE "currencyId"='TZS');

-- accountType
INSERT INTO
  ledger."accountType"("accountTypeId", "name", "code")
SELECT
  1, 'mWallet','mw'
WHERE
  NOT EXISTS (SELECT 1 FROM ledger."accountType" WHERE "name"='mWallet');

INSERT INTO
  ledger."accountType"("accountTypeId", "name", "code")
SELECT
  2, 'settlement','s'
WHERE
  NOT EXISTS (SELECT 1 FROM ledger."accountType" WHERE "name"='settlement');

INSERT INTO
  ledger."accountType"("accountTypeId", "name", "code")
SELECT
  3, 'fee','f'
WHERE
  NOT EXISTS (SELECT 1 FROM ledger."accountType" WHERE "name"='fee');


-- account
INSERT INTO
  ledger.account("name", "accountNumber", "credit", "debit", "accountTypeId", "isDisabled", "parentId", "creationDate", "currencyId")
SELECT
  'settlement', '000000001', 10000, 0, 2, FALSE, NULL, '2016-08-24 10:24:45.845802', 'USD'
WHERE
  NOT EXISTS (SELECT 1 FROM ledger.account  WHERE "accountNumber"='000000001');

INSERT INTO
  ledger.account("name", "accountNumber", "credit", "debit", "accountTypeId", "isDisabled", "parentId", "creationDate", "currencyId")
SELECT
  'fee', '000000002', 10000, 0, 3, FALSE, NULL, '2016-08-24 10:24:45.845802', 'USD'
WHERE
  NOT EXISTS (SELECT 1 FROM ledger.account  WHERE "accountNumber"='000000002');

INSERT INTO
  ledger.account("name", "accountNumber", "credit", "debit", "accountTypeId", "isDisabled", "parentId", "creationDate", "currencyId")
SELECT
  'testAccount1', '000000011', 10000, 1000, 1, FALSE, NULL, '2016-08-24 10:24:45.845802', 'USD'
WHERE
  NOT EXISTS (SELECT 1 FROM ledger.account  WHERE "accountNumber"='000000011');

INSERT INTO
  ledger.account("name", "accountNumber", "credit", "debit", "accountTypeId", "isDisabled", "parentId", "creationDate", "currencyId")
SELECT
  'testAccount2', '000000012', 10000, 1000, 1, FALSE, NULL, '2016-08-24 10:24:45.845802', 'USD'
WHERE
  NOT EXISTS (SELECT 1 FROM ledger.account  WHERE "accountNumber"='000000012');

INSERT INTO
  ledger.account("name", "accountNumber", "credit", "debit", "accountTypeId", "isDisabled", "parentId", "creationDate", "currencyId")
SELECT
  'testAccount3', '000000013', 10000, 1000, 1, FALSE, NULL, '2016-08-24 10:24:45.845802', 'USD'
WHERE
  NOT EXISTS (SELECT 1 FROM ledger.account  WHERE "accountNumber"='000000013');

INSERT INTO
  ledger.account("name", "accountNumber", "credit", "debit", "accountTypeId", "isDisabled", "parentId", "creationDate", "currencyId")
SELECT
  'testAccount4', '000000014', 10000, 1000, 1, FALSE, NULL, '2016-08-24 10:24:45.845802', 'USD'
WHERE
  NOT EXISTS (SELECT 1 FROM ledger.account  WHERE "accountNumber"='000000014');
