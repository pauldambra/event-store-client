var assert = require("assert");
var uuid   = require('node-uuid');

var EventStoreClient = require("../index.js");
var dbconn = require("./common/dbconn");
var defaultHostName = dbconn.defaultHostName;
var credentials = dbconn.credentials;

describe('Connection', function() {
    describe('Establishing a connection', function() {
        it('should connect successfully to eventstore', function(done) {
            var options = {
                host: defaultHostName,
                onError: done
            };
            var connection = new EventStoreClient.Connection(options);
            connection.sendPing(function() {
                connection.close();
                done();
            });
        });

        it('should fail to connect to nosuchhost.example.com', function(done) {
            var options = {
                host: "nosuchhost.example.com",
                onError: function(err) {
                    assert.equal(err.code, "ENOTFOUND", "Expected to get an ENOTFOUND error as the host does not exist");
                    done();
                }
            };
            var connection = new EventStoreClient.Connection(options);
            connection.sendPing(function() {
                assert.fail("Should not have been able to send a ping across a failed connection");
            });
        });

        it('should call close event handler', function(done) {
            var options = {
                host: defaultHostName,
                onError: done,
                onClose: function (hadError) {
                    assert.notEqual(hadError, true);
                    done();
                }
            };
            var connection = new EventStoreClient.Connection(options);
            connection.sendPing(function() {
                connection.close();
            });
        });
    });

    describe('Writing to a stream', function() {
        it("should be able to write 1 event with a binary GUID to the end of the stream", function(done) {
            var options = {
                host: defaultHostName,
                onError: done
            };

            var streamId = "event-store-client-test";
            var expectedVersion = EventStoreClient.ExpectedVersion.Any;
            var requireMaster = false;
            var events = [{
                eventId: EventStoreClient.Connection.createGuid(),
                eventType: "TestEvent",
                data: {
                    testRanAt: new Date().toISOString()
                }
            }];

            var connection = new EventStoreClient.Connection(options);
            connection.writeEvents(streamId, expectedVersion, requireMaster, events, credentials, function (completed) {
                assert.equal(completed.result, EventStoreClient.OperationResult.Success,
                    "Expected a result code of Success, not " + EventStoreClient.OperationResult.getName(completed.result) + ": " + completed.message
                );

                connection.close();
                done();
            });
        });
        it("should be able to write 1 event with a hex GUID to the end of the stream", function(done) {
            var options = {
                host: defaultHostName,
                onError: done
            };

            var streamId = "event-store-client-test";
            var expectedVersion = EventStoreClient.ExpectedVersion.Any;
            var requireMaster = false;
            var events = [{
                eventId: EventStoreClient.Connection.createGuid().toString('hex'),
                eventType: "TestEvent",
                data: {
                    testRanAt: new Date().toISOString()
                }
            }];

            var connection = new EventStoreClient.Connection(options);
            connection.writeEvents(streamId, expectedVersion, requireMaster, events, credentials, function (completed) {
                assert.equal(completed.result, EventStoreClient.OperationResult.Success,
                    "Expected a result code of Success, not " + EventStoreClient.OperationResult.getName(completed.result) + ": " + completed.message
                );

                connection.close();
                done();
            });
        });

        it("should be able to write 1 event with a braced hex GUID to the end of the stream", function(done) {
            var options = {
                host: defaultHostName,
                onError: done
            };

            var streamId = "event-store-client-test";
            var expectedVersion = EventStoreClient.ExpectedVersion.Any;
            var requireMaster = false;
            var events = [{
                eventId: uuid.unparse(EventStoreClient.Connection.createGuid()),
                eventType: "TestEvent",
                data: {
                    testRanAt: new Date().toISOString()
                }
            }];

            var connection = new EventStoreClient.Connection(options);
            connection.writeEvents(streamId, expectedVersion, requireMaster, events, credentials, function (completed) {
                assert.equal(completed.result, EventStoreClient.OperationResult.Success,
                    "Expected a result code of Success, not " + EventStoreClient.OperationResult.getName(completed.result) + ": " + completed.message
                );

                connection.close();
                done();
            });
        });
    });
});