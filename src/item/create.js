'use strict';

const getBatchWriteSingleItem = (item) => {
    return {
        PutRequest: {
            Item: item,
        },
    };
};

module.exports = (createDataGroup) => {
    createDataGroup = Array.isArray(createDataGroup) ? createDataGroup : [createDataGroup];

    const paramsBatch = [];

    createDataGroup.forEach((createData) => {
        while (createData.items.length) {
            const itemsBatch = {
                RequestItems: {
                    [createData.tableName]: createData.items.splice(0, 25).map(getBatchWriteSingleItem),
                },
            };

            paramsBatch.push(itemsBatch);
        }
    });

    return {
        type: 'dynamoDoc',
        action: 'batchWrite',
        paramsBatch,
    };
};
