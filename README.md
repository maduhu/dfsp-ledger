# DFSP-Ledger service

## Summary ##

This service is used to keep the track for all the transactions that have been made in the DFSP system. Here are stored also user's financial accounts with their credit and debit balances. The full list with the used table is as follow: 

1. Account - In this table is stored the all the data related to the customer accounts
    - Account ID - accountId;
    - Account name - name;
    - Account number - accountNumber;
    - Credit balance - credit;
    - Debit balance- debit;
    - Account type Id - accountTypeId, which refer to the ledger accountType table;
    - If the account has been disabled - isDisabled;
    - Account's parent ID - parentId;
    - Date of creation - creationDate;
    - Currency ID - currencyId which refer to the ledger currency table;

2. Account Type - In this table are stored all the account types which for the current moments are: 
    - mWallet
    - settlement
    - fee
    - commission
    - agentCommission,
    - connector

3. Commission - The main purpose of this table is to hold all the commission transfer that have been made in the DFSP system. It contains the following information for each such transfer: 
    - Commission ID - commissionId;
    - Date of the transfer - transferDate;
    - ID of the debit account - debitAccountId, which refer to the ledger account table;
    - ID of the credit account - creditAccountId, which refer to the ledger account table;
    - Currency ID - currencyId, which refer to the ledger currency table;
    - Commission transaction amount - amount;
    - Transfer ID - transferId;

4. Currency - The main purpose of this table is to hold all the supported currencies in the DFSP system. Each currency is described by unique currencyId, name and symbol;

5. Fee - The main purpose of this table is to hold all the fee transfers that have been made in the DFSP system. It contains the following information about each such transfer:
    - Fee ID - feeId;
    - Date of transfer - transferDate;
    - ID of the debit account - debitAccountId, which refer to the ledger account table;
    - ID of the credit account - creditAccountId, which refer to the ledger account table;
    - Currency ID - currencyId, which refer to the ledger currency table;
    - Fee transaction amount - amount;
    - Transfer ID - transferId;

6. Quote - This table is used to store the quotes in the payer's DFSP side which are signed by the payee's DFSP side. All the quotes which are not paid expires after predefined period of time. Once the quote have been executed it remain in the quote table. This table contain the following data: 
    - Quote ID - quoteId;
    - Unique payment ID - paymentId;
    - Client's identifier - identifier;
    - Client's identifier type - identifierType;
    - Destination account - destinationAccount;
    - Receiver - receiver;
    - Currency ID - currencyId, which refer to the ledger currency table;
    - Quote amount - amount;
    - Quote fee - fee;
    - Quote commission - commission;
    - Quote transfer type - transfer type;
    - Quote IPR - ipr;
    - Source expiry duration - sourceExpiryDuration;
    - Which will be the used connector account - connectorAccount;
    - Is this the debit account or not - isDebit;
    - Expires at - expiresAt;
    - Signed quote from the payee's side - params;

7. Transfer - This table holds all the transactions that has been made in the DFSP system. All the data stored in this tabe is as follow: 
    - Transfer ID - transferId;
    - Unique paymentId - paymentId;
    - Transfer date - transferDate;
    - Transfer type ID - transferTypeId;
    - ID of the debit account - debitAccountId, which refer to the ledger account table;
    - ID of the credit account - creditAccountId, which refer to the ledger account table;
    - Currency ID - currencyId, which refer to the ledger currency table;
    - Debit identifier - debitIdentifier;
    - Debit identifier type - debitIdentifierType;
    - Some additional data related to the debit - debitMemo;
    - Credit identifier - creditIdentifier;
    - Credit identifier type - creditIdentifierType;
    - Some additional date relate to the credit - crediMemo;
    - Fulfillment - fulfillment;
    - Transfer amount - amount;
    - Transfer description - description;
    - Transfer execution condition - executionCondition;
    - Transfer cancellationCondition - cancellationCondition;
    - Transfer state id - transferStateId;
    - Expiration date - expiresAt;
    - Proposed At - proposedAt;
    - Prepared at - preparedAt;
    - Rejected at - rejectedAt - if rejected;
    - Creation date - creationDate;

8. Transfer state - contain all the transfer states which for the current moment are: proposed, prepared, cancelled, executed, rejected;

9. Transfer type - contain all the transfer types which for the current moment are: 
    - Person to person - p2p;
    - Invoice - invoice;
    - Fee - fee;
    - Bulk payment - bulkPayment;
    - Cash in - cashIn;
    - Cash out - cashOut;
    - Unknown - unknown;
