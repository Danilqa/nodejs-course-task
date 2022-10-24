'use strict';

const fs = require('node:fs');
const util = require('node:util');
const path = require('node:path');
const config = require('./config.js');

class Logger {
  #LOGGERS = {
    pino: () => new PinoLogger(),
    native: () => new NativeLogger()
  }

  #currentLogger;

  constructor(logPath, type) {
    this.path = logPath;
    this.#currentLogger = this.#LOGGERS[type]();

    const date = new Date().toISOString().substring(0, 10);
    const filePath = path.join(logPath, `${date}.log`);
    this.stream = fs.createWriteStream(filePath, { flags: 'a' });
    this.regexp = new RegExp(path.dirname(this.path), 'g');
  }

  close() {
    return new Promise((resolve) => this.stream.end(resolve));
  }

  write(type = 'info', message) {
    this.#currentLogger.log(type, message);
  }

  log(...args) {
    const msg = util.format(...args);
    this.write('info', msg);
  }

  dir(...args) {
    const msg = util.inspect(...args);
    this.write('info', msg);
  }

  debug(...args) {
    const msg = util.format(...args);
    this.write('debug', msg);
  }

  error(...args) {
    const msg = util.format(...args).replace(/[\n\r]{2,}/g, '\n');
    this.write('error', msg.replace(this.regexp, ''));
  }

  system(...args) {
    const msg = util.format(...args);
    this.write('system', msg);
  }

  access(...args) {
    const msg = util.format(...args);
    this.write('access', msg);
  }
}

class NativeLogger {
  static #DATETIME_LENGTH = 19;

  static #COLORS = {
    info: '\x1b[1;37m',
    debug: '\x1b[1;33m',
    error: '\x1b[0;31m',
    system: '\x1b[1;34m',
    access: '\x1b[1;38m',
  };

  log(type, message) {
    const now = new Date().toISOString();
    const date = now.substring(0, NativeLogger.#DATETIME_LENGTH);
    const color = NativeLogger.#COLORS[type];
    const line = date + '\t' + message;
    console.log(color + line + '\x1b[0m');
  }
}

class PinoLogger {
  #instance;

  constructor() {
    const pino = require('pino');
    const pretty = require('pino-pretty');

    this.#instance = pino(pretty());
  }

  log(type, message) {
    this.#instance[type](message);
  }
}

module.exports = new Logger('./log', config.logger);
