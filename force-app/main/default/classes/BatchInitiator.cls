public with sharing class BatchInitiator {
    private final Account account;

    public BatchInitiator(ApexPages.StandardController stdController) {
        this.account = (Account)stdController.getRecord();
    }

    public PageReference startBatchProcess() {
        UpdateAccountBatchForCustomButton batchProcess = new UpdateAccountBatchForCustomButton(account.Id);
        Database.executeBatch(batchProcess);

        PageReference accountPage = new PageReference('/' + account.Id);
        accountPage.setRedirect(true);
        return accountPage;
    }
}