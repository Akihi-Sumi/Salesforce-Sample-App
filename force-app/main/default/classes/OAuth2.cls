public with sharing class OAuth2 {
    // https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_endpoints.htm&type=5
    private static final String TOKEN_ENDPOINT = '';
    private static final String CLIENT_ID = '';
    private static final String CLIENT_SECRET = '';

    public static String getAccessToken() {
        HttpRequest req = new HttpRequest();
        req.setEndpoint(TOKEN_ENDPOINT);
        req.setMethod('POST');
        req.setHeader('Content-type', 'application/x-www-form-urlencoded');

        String body = 'grant_type=client_credentials' +
                      '&client_id=' + EncodingUtil.urlEncode(CLIENT_ID, 'UTF-8') +
                      '&client_secret=' + EncodingUtil.urlEncode(CLIENT_SECRET, 'UTF-8');
        
        req.setBody(body);

        Http http = new Http();
        HttpResponse res =http.send(req);

        if (res.getStatusCode() == 200) {
            Map<String,Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
            System.debug('アクセストークンを取得しました');
            return (String) responseMap.get('access_token');
        }

        return null;
    }
}