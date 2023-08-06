"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sqsHandler_1 = require("../utils/sqsHandler");
const router = express_1.default.Router();
(0, sqsHandler_1.pollSQSQueue)().catch((err) => console.error("Error in pollSQSQueue: ", err));
router.get("/", (req, res) => {
    res.send("Crawler server is running!");
});
exports.default = router;
