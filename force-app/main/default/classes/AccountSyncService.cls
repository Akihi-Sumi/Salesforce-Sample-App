public with sharing class AccountSyncService {
    private static final String TARGET_INSTANCE_URL = '';

    public static void syncAccounts(List<String> accountIds) {
        String accessToken = OAuth2.getAccessToken();

        if (accessToken == null) {
            System.debug('アクセストークンの取得に失敗しました');
            return;
        }

        List<Account> accounts = [SELECT Id, Name, Phone, Website FROM Account WHERE Id IN :accountIds];

        if (accounts.isEmpty()) {
            System.debug('取引先データがありません');
            return;
        }

        List<Map<String,Object>> accountDataList = new List<Map<String,Object>>();

        for (Account account : accounts) {
            accountDataList.add(new Map<String,Object>{
                'Id' => account.Id,
                'Name' => account.Name,
                'Phone' => account.Phone,
                'Website' => account.Website
            });
        }

        Map<String,Object> requestBody = new Map<String,Object>{
            'accounts' => accountDataList
        };

        HttpRequest req = new HttpRequest();
        req.setEndpoint(TARGET_INSTANCE_URL);
        req.setMethod('POST');
        req.setHeader('Authorization', 'Bearer ' + accessToken);
        req.setHeader('Content-Type', 'application/json');
        req.setBody(JSON.serialize(requestBody));
        System.debug('JSON Request Body : ' + req.getBody());

        Http http = new Http();
        HttpResponse res = http.send(req);

        if (res.getStatusCode() == 200) {
            System.debug('処理成功');
        } else {
            System.debug('処理失敗' + res.getBody());
        }
    }
}