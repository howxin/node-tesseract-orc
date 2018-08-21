"use strict";
const util = require('util');
const execRaw = require('child_process').exec;
const incov = require('iconv-lite');
const {ERRORS} = require('../lib/constants');
const ENCODING = process.platform === 'win32' ? 'cp936' : 'utf8';

const opts = {
    encoding: 'binary'
};

const CheckCommandTemplate = {
    'win32': `where %s`,
    'other': `command -v %s`
};

async function exec(cmd, opts) {
    return new Promise(res => {
        execRaw(cmd, opts, (error, stdout, stderr) => {
            res({
                stdout,
                stderr
            })
        });
    });
}

async function run(cmd = '') {
    try {
        if (!cmd || typeof cmd !== 'string') {
            const err =  new Error(ERRORS.ERR_COMMAND_RUN_ERROR);
            err.errcmd = cmd;
            throw err;
        }

        const result = await exec(cmd, opts).catch((err) => {
            const {stdout, stderr, stack} = err;
            return {stdout, stderr, stack};
        });

        result.stdout = incov.decode(Buffer.from(result.stdout, 'binary'), ENCODING);
        result.stderr = incov.decode(Buffer.from(result.stderr, 'binary'), ENCODING);
        return result;
    } catch (err) {
        throw err;
    }
}

async function check(cmd = '') {
    if (!cmd || typeof cmd !== 'string') {
        const err =  new Error(ERRORS.ERR_COMMAND_CHECK_ERROR);
        err.errcmd = cmd;
        throw err;
    }

    if (process.platform === 'win32') cmd = util.format(CheckCommandTemplate.win32, cmd.trim());
    else cmd = util.format(CheckCommandTemplate.other, cmd);

    const result = await exec(cmd, opts).catch((err) => {
        const {stdout, stderr, stack} = err;
        return {stdout, stderr, stack};
    });

    if (result.stderr) return false;

    return true;
}

module.exports = {
    run,
    check
};