global with sharing class ScheduleUpdateAccountBatch implements Schedulable {
    global void execute(SchedulableContext sc) {
        UpdateAccountBatch batch = new UpdateAccountBatch();
        Database.executeBatch(batch);
    }
}