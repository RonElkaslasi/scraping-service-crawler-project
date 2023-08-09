"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pollSQSQueue = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const crawlerHandler_1 = require("./crawlerHandler");
aws_sdk_1.default.config.update({ region: process.env.AWS_REGION });
const sqs = new aws_sdk_1.default.SQS({ apiVersion: "2012-11-05" });
function pollSQSQueue() {
    return __awaiter(this, void 0, void 0, function* () {
        const params = {
            QueueUrl: process.env.QUEUE_URL || "",
            MaxNumberOfMessages: 10,
            WaitTimeSeconds: 20,
        };
        while (true) {
            try {
                const data = yield sqs.receiveMessage(params).promise();
                if (data.Messages) {
                    for (const message of data.Messages) {
                        console.log(message);
                        yield (0, crawlerHandler_1.processScrapeRequest)(message);
                        yield sqs
                            .deleteMessage({
                            QueueUrl: process.env.QUEUE_URL,
                            ReceiptHandle: message.ReceiptHandle,
                        })
                            .promise();
                    }
                }
            }
            catch (err) {
                console.error("Error receiving messages from SQS: ", err);
            }
        }
    });
}
exports.pollSQSQueue = pollSQSQueue;
