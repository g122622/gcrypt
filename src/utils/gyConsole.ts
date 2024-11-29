/**
 * File: \src\utils\gyConsole.ts
 * Project: Gcrypt
 * Created Date: 2023-11-26 17:14:30
 * Author: Guoyi
 * -----
 * Last Modified: 2024-02-13 16:46:05
 * Modified By: Guoyi
 * -----
 * Copyright (c) 2024 Guoyi Inc.
 *
 * ------------------------------------
 */

const log = function (arg: string) {
    console.log(
        `%c@ LOG | at ${new Date().toLocaleTimeString()}::${new Date().getMilliseconds()}`,
        `
          background-color: #3f51b5;
          color: #eee;
          font-weight: bold;
          padding: 4px 8px;
          border-radius: 4px;
        `,
        [arg].join("")
    );
};

const error = function (arg: string) {
    console.log(
        `%c@ ERROR | at ${new Date().toLocaleTimeString()}::${new Date().getMilliseconds()}`,
        `
          background-color: #eb5c5a;
          color: #eee;
          font-weight: bold;
          padding: 4px 8px;
          border-radius: 4px;
        `,
        [arg].join("")
    );
    console.trace();
};

const warn = function (arg: string) {
    console.log(
        `%c@ WARNING | at ${new Date().toLocaleTimeString()}::${new Date().getMilliseconds()}`,
        `
          background-color: #fbc02d;
          color: #eee;
          font-weight: bold;
          padding: 4px 8px;
          border-radius: 4px;
        `,
        [arg].join("")
    );
};

const success = function (arg: string) {
    console.log(
        `%c@ SUCCESS | at ${new Date().toLocaleTimeString()}::${new Date().getMilliseconds()}`,
        `
          background-color: #4caf50;
          color: #eee;
          font-weight: bold;
          padding: 4px 8px;
          border-radius: 4px;
        `,
        [arg].join("")
    );
};

export { log, error, warn, success };
