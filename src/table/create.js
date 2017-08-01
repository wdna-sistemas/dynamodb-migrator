'use strict';

const getParams = (tableConfig) => {
    const params = {
        TableName: tableConfig.tableName,
        ProvisionedThroughput: {
            ReadCapacityUnits: tableConfig.read || 1,
            WriteCapacityUnits: tableConfig.write || 1,
        },
    };

    params.KeySchema = Object.keys(tableConfig.primaryKey).map((primaryKey, index) => {
        return {
            AttributeName: primaryKey,
            KeyType: index === 0 ? 'HASH' : 'RANGE',
        };
    });

    const attributes = Object.assign({}, tableConfig.primaryKey);

    if (tableConfig.indexes) {
        params.GlobalSecondaryIndexes = Object.keys(tableConfig.indexes).map((indexName) => {
            const indexConfig = tableConfig.indexes[indexName];
            return {
                IndexName: indexName,
                KeySchema: Object.keys(indexConfig.primaryKey).map((primaryKey, index) => {
                    attributes[primaryKey] = indexConfig.primaryKey[primaryKey];
                    return {
                        AttributeName: primaryKey,
                        KeyType: index === 0 ? 'HASH' : 'RANGE',
                    };
                }),
                ProvisionedThroughput: {
                    ReadCapacityUnits: indexConfig.read || 1,
                    WriteCapacityUnits: indexConfig.write || 1,
                },
                Projection: {
                    ProjectionType: indexConfig.projection || 'ALL',
                },
            };
        });
    }

    if (tableConfig.stream) {
        params.StreamSpecification = {
            StreamEnabled: true,
            StreamViewType: tableConfig.stream,
        };
    }

    params.AttributeDefinitions = Object.keys(attributes).map((primaryKey) => {
        return {
            AttributeName: primaryKey,
            AttributeType: attributes[primaryKey],
        };
    });

    return params;
};

module.exports = (tableToCreate) => {
    const tables = Array.isArray(tableToCreate) ? tableToCreate : [tableToCreate];

    const paramsBatch = tables.map((table) => {
        return getParams(table);
    });

    return {
        type: 'dynamo',
        action: 'createTable',
        paramsBatch,
    };
};
