'use strict';

/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const config = require('../config.json');

const nowISO = () => {
    return (new Date()).toISOString();
};

const filename = `${nowISO()}.json`;
const filenamePath = path.join(__dirname, '..', config.MIGRATION_DIR, filename);

fs.writeFileSync(filenamePath, '{}');

console.log(`Seed file created: ${filenamePath}`);
