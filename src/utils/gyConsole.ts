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

import dayjs from "dayjs";
import logger from "./helpers/Logger";

const getCurrentTimeString = function () {
    return dayjs().format("YYYY-MM-DD HH:mm:ss.SSS");
};

let counter = 0;

const customLog = function (label: string, color: string, message: string) {
    console.log(
        `%c${label} | at ${getCurrentTimeString()} | [${++counter}]`,
        `
          background-color: ${color};
          color: #eee;
          font-weight: bold;
          padding: 4px 8px;
          border-radius: 4px;
        `,
        [message].join("")
    );
};

const log = function (arg: string) {
    customLog("LOG", "#3f51b5", arg);
};

const error = function (arg: string) {
    customLog("ERROR", "#eb5c5a", arg);
    console.trace();
    logger.log(arg, "error");
};

const warn = function (arg: string) {
    customLog("WARNING", "#fbc02d", arg);
};

const success = function (arg: string) {
    customLog("SUCCESS", "#4caf50", arg);
};

export { log, error, warn, success, customLog };
