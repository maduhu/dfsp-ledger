INSERT INTO ledger."transferState" ("transferStateId", name,"transferStateCode")
       SELECT  2, 'prepared','pre'
       WHERE NOT EXISTS (SELECT 1 FROM ledger."transferState" WHERE name='prepared');



INSERT INTO ledger."transferState" ("transferStateId", name,"transferStateCode")
       SELECT  1, 'proposed','pro'
       WHERE NOT EXISTS (SELECT 1 FROM ledger."transferState" WHERE name='proposed');



INSERT INTO ledger."transferState" ("transferStateId", name,"transferStateCode")
       SELECT  3, 'cancelled','can'
       WHERE NOT EXISTS (SELECT 1 FROM ledger."transferState" WHERE name='cancelled');


INSERT INTO ledger."transferState" ("transferStateId", name,"transferStateCode")
       SELECT  3, 'executed','exe'
       WHERE NOT EXISTS (SELECT 1 FROM ledger."transferState" WHERE name='executed');



 INSERT INTO ledger."transferType"(  "transferTypeId",  name,  "transferCode")
              SELECT  1, 'person to person','p2p'
 WHERE NOT EXISTS (SELECT 1 FROM ledger."transferType" WHERE "transferCode"='p2p');


  INSERT INTO ledger."currency"(  "currencyId",  name)
              SELECT  'USD', 'US Dollar'
 WHERE NOT EXISTS (SELECT 1 FROM ledger.currency WHERE "currencyId"='USD');


   INSERT INTO ledger."currency"(  "currencyId",  name)
              SELECT  'CNY', ' Chinese Yuan Renminbi'
 WHERE NOT EXISTS (SELECT 1 FROM ledger.currency WHERE "currencyId"='CNY');

  INSERT INTO ledger."accountType"(  "accountTypeId",  name,code)
              SELECT  1, 'mWallet','mw'
 WHERE NOT EXISTS (SELECT 1 FROM ledger."accountType" WHERE "name"='mWallet');



 