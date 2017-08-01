#!/usr/bin/env node

'use strict';

const migrate = require('../src/migrate');
const create = require('../src/create');

const commands = {
    migrate,
    create,
};

const command = process.argv[2];
if (process.argv.length < 3 || Object.keys(commands).indexOf(command) === -1) {
    console.log('You must specify one command: create or migrate');
    process.exit(1);
}

commands[command]();
