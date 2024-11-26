global with sharing class UpdateAccountBatch implements Database.Batchable<sObject> {
    global Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator('SELECT Id, Name FROM Account WHERE LastModifiedDate >= TODAY');
    }

    public class AccountSyncQueueable implements Queueable, Database.AllowsCallouts {
        private List<String> accountIds;

        public AccountSyncQueueable(List<String> accountIds) {
            this.accountIds = accountIds;
        }

        public void execute(QueueableContext context) {
            AccountSyncService.syncAccounts(accountIds);
        }
    }

    global void execute(Database.BatchableContext bc, List<Account> accounts) {
        List<String> accountIds = new List<String>();

        for (sObject account : accounts) {
            accountIds.add(account.Id);
        }

        System.enqueueJob(new AccountSyncQueueable(accountIds));
    }

    global void finish(Database.BatchableContext bc) {
        System.debug('バッチ処理終了');
    }
}