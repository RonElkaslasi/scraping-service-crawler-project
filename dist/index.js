"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sqsHandler_1 = require("./handlers/sqsHandler");
const main = () => {
    console.log("Connected");
    (0, sqsHandler_1.pollSQSQueue)().catch((err) => console.error("Error in pollSQSQueue: ", err));
};
main();
