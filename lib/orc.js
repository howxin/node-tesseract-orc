"use strict";
const {existsSync} = require('fs');
const {format} = require('util');
const {normalize, isAbsolute} = require('path');
const {run, check} = require('../lib/tcommand');
const {ERRORS} = require('../lib/constants');

class Orc {
    constructor(options = {}) {
        const self = this;

        // 指定输出文件
        self.outputBase = options.outputBase;
        if (!self.outputBase || typeof self.outputBase !== 'string') {
            throw new Error(ERRORS.ERR_INVALID_OUTPUT_BASE);
        }
        // 指定tessdata路径的位置
        self.tessdataDir = options.tessdataDir || __dirname;
        if (typeof self.tessdataDir !== 'string' || !isAbsolute(self.tessdataDir)) {
            throw new Error(ERRORS.ERR_INVALID_TESSDATA_DIR);
        }

        // 指定用户字文件的位置。
        self.userWords = options.userWords;
        // 指定用户模式文件的位置。
        self.userPatterns = options.userPatterns;
        // 指定用于OCR的语言
        self.lang = options.lang || 'eng';
        // 设置配置变量的值。允许多个-c参数。
        self.variables = options.variables;
        // 指定页面分割模式。
        self.psm = options.psm || 7;
        if (Math.floor(+self.psm) !== +self.psm || self.psm < 0 || self.psm > 7) {
            throw new Error(ERRORS.ERR_INVALID_PSM);
        }
        // 指定OCR引擎模式。
        // self.oem = options.oem || 1;
        // if (Math.floor(+self.oem) !== +self.oem || self.oem < 0 || self.oem > 3) {
        //     throw new Error(ERRORS.ERR_INVALID_OEM);
        // }
    }

    _combineCmd() {
        return `tesseract %s ${this.outputBase}`
            + (this.tessdataDir ? ` --tessdata-dir ${normalize(this.tessdataDir)}` : '')
            + (this.userWords ? ` --user-words ${this.userWords}` : '')
            + (this.userPatterns ? ` --user-patterns ${this.userPatterns}` : '')
            + (this.lang ? ` -l ${this.lang}` : '')
            + (this.variables ? ` -c ${this.variables}` : '')
            + ` -psm ${this.psm}`;
    }

    async recognize(imagePath) {
        if (!imagePath || typeof imagePath !== 'string' || !isAbsolute(imagePath)) {
            throw new Error(ERRORS.ERR_INVALID_IMAGE);
        }
        if (!existsSync(imagePath)) throw new Error(ERRORS.ERR_FILE_NO_FIND);
        if (!await check('tesseract')) throw new Error(ERRORS.ERR_TESSERACT_NO_INSTALL);
        let cmd = this._combineCmd();
        return run(format(cmd, imagePath));
    }
}

module.exports = Orc;