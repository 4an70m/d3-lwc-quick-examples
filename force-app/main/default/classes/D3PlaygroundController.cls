public with sharing class D3PlaygroundController {

    @AuraEnabled(Cacheable=true)
    public static List<Account> getAccounts() {
        return [SELECT Id, Name, NumberOfEmployees, AnnualRevenue FROM Account];
    }
}