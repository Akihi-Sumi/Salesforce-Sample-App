// B社環境に作成する
@RestResource(urlmapping='/CreateOrUpdateAccounts/*')
global with sharing class CreateUpdateAccountWithRests {
    global class AccountData {
        public String Id;
        public String Name;
        public String Phone;
        public String Website;
    }

    global class AccountDataWrapper {
        public List<AccountData> accounts;
    }

    @HttpPost
    global static String createOrUpdateAccounts() {
        RestRequest request = RestContext.request;
        List<Account> accountsToUpsert = new List<Account>();
        AccountDataWrapper wrapper = (AccountDataWrapper)JSON.deserialize(request.requestBody.toString(), AccountDataWrapper.class);

        for (AccountData data : wrapper.accounts) {
            Account acc = new Account(
                ExternalId__c = data.Id,
                Name = data.Name,
                Phone = data.Phone,
                Website = data.Website
            );

            accountsToUpsert.add(acc);
        }

        JSONGenerator jsong = JSON.createGenerator(true);
        jsong.writeStartObject();

        try {
            upsert accountsToUpsert Account.ExternalId__c;

            jsong.writeStringField('Status', 'Success');
            jsong.writeFieldName('Ids');
            jsong.writeStartArray();

            for (Account acc : accountsToUpsert) {
                jsong.writeString(acc.Id);
            }

            jsong.writeEndArray();
        } catch (Exception e) {
            jsong.writeStringField('Status', 'Error');
            jsong.writeStringField('Error', e.getMessage());
        }

        jsong.writeEndObject();

        return jsong.getAsString();
    }
}