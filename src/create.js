'use strict';

const fs = require('fs');
const path = require('path');
const defaults = require('../defaults.json');

const migrationDir = process.env.MIGRATION_DIR || defaults.MIGRATION_DIR;

const nowISO = () => {
    return (new Date()).toISOString();
};

const filename = `${nowISO()}.json`;
const migrationPath = path.join(process.cwd(), migrationDir);
const filenamePath = path.join(migrationPath, filename);

module.exports = () => {
    if (!fs.existsSync(migrationPath)) {
        fs.mkdirSync(migrationPath);
    }
    fs.writeFileSync(filenamePath, '{\n\n}');

    console.log(`Seed file created: ${filenamePath}`);
};
