'use strict';

const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const Promise = require('bluebird');
const question = require('cli-interact').getYesNo;
const config = require('../defaults.json');

const createTables = require('./table/create');
const createItems = require('./item/create');

const dynamoConfig = {};
if (process.env.DYNAMO_ENDPOINT) {
    dynamoConfig.endpoint = process.env.DYNAMO_ENDPOINT;
}

const dynamo = new AWS.DynamoDB(dynamoConfig);
const dynamoDoc = new AWS.DynamoDB.DocumentClient(dynamoConfig);
const migrationDir = process.env.MIGRATION_DIR || config.MIGRATION_DIR;

const migrationPath = path.join(process.cwd(), migrationDir);

const migrationTableName = process.env.MIGRATION_TABLE || config.DEFAULT_MIGRATION_TABLE_CONFIG.tableName;
const migrationAttribute = process.env.MIGRATION_ATTRIBUTE || config.DEFAULT_MIGRATION_TABLE_CONFIG.attributeName;

const checkMigrationTable = () => {
    return dynamo.describeTable({
        TableName: migrationTableName,
    }).promise()
        .catch((err) => {
            if (err.code === 'ResourceNotFoundException') {
                return dynamo.createTable({
                    TableName: migrationTableName,
                    ProvisionedThroughput: {
                        ReadCapacityUnits: 1,
                        WriteCapacityUnits: 1,
                    },
                    AttributeDefinitions: [
                        {
                            AttributeName: migrationAttribute,
                            AttributeType: 'S',
                        },
                    ],
                    KeySchema: [
                        {
                            AttributeName: config.DEFAULT_MIGRATION_TABLE_CONFIG.attributeName,
                            KeyType: 'HASH',
                        },
                    ],
                }).promise();
            }
            return Promise.reject(err);
        });
};

const getMigrationData = (migration) => {
    return migration[migrationAttribute];
};

const scanAll = (lastKey) => {
    return dynamoDoc.scan({
        TableName: migrationTableName,
        ExclusiveStartKey: lastKey,
        Limit: 1,
    }).promise()
        .then((data) => {
            const items = data.Items.map(getMigrationData);
            if (data.LastEvaluatedKey) {
                return scanAll(data.LastEvaluatedKey)
                    .then((recursiveItems) => {
                        return items.concat(recursiveItems);
                    });
            }
            return items;
        });
};

const getMigrationsDone = () => {
    return scanAll();
};

const runMigration = (migration) => {
    const toRun = [];

    if (migration.table) {
        if (migration.table.create) {
            toRun.push(createTables(migration.table.create));
        }
        if (migration.table.delete) {
            // TODO
        }
        if (migration.table.update) {
            // TODO
        }
    }

    if (migration.item) {
        if (migration.item.create) {
            toRun.push(createItems(migration.item.create));
        }
        if (migration.item.delete) {
            // TODO
        }
        if (migration.item.update) {
            // TODO
        }
    }

    const promises = toRun.map((data) => {
        console.log(data);
        switch (data.type) {
            case 'dynamo':
                return Promise.all(data.paramsBatch.map((params) => {
                    return dynamo[data.action](params).promise();
                }));
            case 'dynamoDoc':
                return Promise.all(data.paramsBatch.map((params) => {
                    return dynamoDoc[data.action](params).promise();
                }));
            default:
                return false;
        }
    });

    return Promise.all(promises);
};

const runMigrations = (migrationsDone) => {
    if (!fs.existsSync(migrationPath)) {
        fs.mkdirSync(migrationPath);
    }
    const migrationFiles = fs.readdirSync(migrationPath);

    const migrations = migrationFiles
        .filter((file) => {
            const migration = file.replace('.json', '');

            return migrationsDone.indexOf(migration) === -1;
        });

    if (!migrations.length) {
        console.log('Everything up to date');
        return true;
    }

    console.log(`Found ${migrations.length} missing migrations:`);
    console.log(`\t${migrations.join('\n\t')}`);

    const answer = question('Run migrations');
    if (!answer) {
        console.log('Migration process canceled by the user');
        return false;
    }

    return migrations
        .reduce((previousMigration, file) => {
            const migration = file.replace('.json', '');
            const fileContent = fs.readFileSync(path.join(migrationPath, file), 'utf-8');
            const migrationObj = JSON.parse(fileContent);

            return previousMigration
                .then(() => {
                    return runMigration(migrationObj);
                })
                .then(() => {
                    return dynamoDoc.put({
                        TableName: migrationTableName,
                        Item: {
                            [migrationAttribute]: migration,
                        },
                    }).promise();
                })
                .then(() => {
                    console.log(`Migration ${migration} success`);
                })
                .catch((err) => {
                    console.log(`Migration ${migration} failed`);
                    return Promise.reject(err);
                });
        }, Promise.resolve());
};

module.exports = () => {
    checkMigrationTable()
        .then(getMigrationsDone)
        .then(runMigrations)
        .then(() => {
            console.log('Migrations run');
        })
        .catch((err) => {
            console.log('Error while running migration', err.stack);
        });
};
