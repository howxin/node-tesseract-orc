"use strict";
const path = require('path');
const assert = require('assert');
const NodeOrc = require('../index');

const instance = new NodeOrc({
    tessdataDir: 'C:\\nodejs_demo\\node-tesseract-orc\\lib\\tessdata',
    outputBase: 'output'
});


describe('orc test', function () {
    describe('#recognize()', function () {
        it('should return -1 when the value is not present', function () {
            instance.recognize(path.join(__dirname, './captcha_1.jpg')).then(res => {
                console.log(res);
            }).catch(err => {
                console.log(err);
            });
        });
    });
});