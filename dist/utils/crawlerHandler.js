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
exports.processScrapeRequest = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = __importDefault(require("cheerio"));
const redisHandler_1 = require("./redisHandler");
const processScrapeRequest = (message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startUrl, maxDepth, maxPages } = JSON.parse(message.Body);
        const queue = [{ url: startUrl, depth: 0 }];
        const visited = new Set();
        const scrapedData = [];
        while (queue.length > 0) {
            const requestFromQueue = queue.shift();
            if (!requestFromQueue)
                break;
            if (requestFromQueue.depth <= maxDepth) {
                if (!visited.has(requestFromQueue.url)) {
                    visited.add(requestFromQueue.url);
                    const response = yield axios_1.default.get(requestFromQueue.url);
                    const html = yield response.data();
                    const $ = cheerio_1.default.load(html);
                    const title = $("title").text();
                    const links = $("a")
                        .map((_, el) => $(el).attr("href"))
                        .get();
                    scrapedData.push({
                        title,
                        depth: requestFromQueue.depth,
                        url: requestFromQueue.url,
                        links,
                    });
                    const unvisitedLinks = links.filter((link) => !visited.has(link));
                    const newDepth = requestFromQueue.depth + 1;
                    for (const link of unvisitedLinks) {
                        if (scrapedData.length < maxPages) {
                            queue.push({ url: link, depth: newDepth });
                        }
                        else
                            break;
                    }
                }
            }
            else
                break;
        }
        (0, redisHandler_1.setDataToRedis)(scrapedData, startUrl);
        console.log("Scrapping job completed and data stored in Redis.");
    }
    catch (err) {
        console.error("Error processing message:", err);
    }
});
exports.processScrapeRequest = processScrapeRequest;
