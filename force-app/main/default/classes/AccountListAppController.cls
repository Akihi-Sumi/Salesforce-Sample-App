public with sharing class AccountListAppController {
    @AuraEnabled(cacheable=true)
    public static List<Account> searchAccounts(String searchText, String recordTypeId, String industry) {
        String searchKeyword = '%' + searchText + '%';
        String query = 'SELECT Id, Name, Phone, Website FROM Account WHERE Name LIKE :searchKeyword';

        if (!String.isBlank(recordTypeId)) {
            query += ' AND RecordTypeId = :recordTypeId';
        }

        if (!String.isBlank(industry)) {
            query += ' AND Industry = :industry';
        }

        query += ' AND Industry__c = false';

        query += ' LIMIT 200';

        return Database.query(query);
    }

    @AuraEnabled(cacheable=true)
    public static List<RecordType> getAccountRecordTypes(){
        return [
            SELECT Id, Name
            FROM RecordType
            WHERE SObjectType = 'Account'
            ORDER BY Name
        ];
    }

    @AuraEnabled
    public static void updateAccounts(List<Account> accountsForUpdate){
        if (!Schema.SObjectType.Account.isUpdateable()) {
            throw new SecurityException('更新権限がありません');
        }

        update accountsForUpdate;
    }

    @AuraEnabled
    public static void deleteAccount(List<Account> accountsForDelete){
        if (!Schema.SObjectType.Account.isDeleteable()) {
            throw new SecurityException(
                '削除権限がありません'
            );
        }

        List<Account> recordsToDelete = [SELECT Id FROM Account WHERE Id IN :accountsForDelete];

        try {
            for (Account acc : recordsToDelete) {
                acc.IsDeleted__c = true;
            }

            update recordsToDelete;
            System.debug('削除成功');
        } catch (Exception e) {
            System.debug(e.getMessage());
        }
    }
}