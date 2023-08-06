import axios from "axios";
import cheerio from "cheerio";
import { ScrapeItem, setDataToRedis } from "./redisHandler";

export const processScrapeRequest = async (message: any) => {
  try {
    const { startUrl, maxDepth, maxPages } = JSON.parse(message.Body);
    const queue = [{ url: startUrl, depth: 0 }];
    const visited = new Set();
    let scrapedData = [];

    while (queue.length > 0) {
      const requestFromQueue = queue.shift();
      if (!requestFromQueue) break;

      if (requestFromQueue.depth <= maxDepth) {
        if (!visited.has(requestFromQueue.url)) {
          const regex =
            /^(http(s)?:\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/;
          if (!regex.test(requestFromQueue.url)) continue;

          const response = await axios.get(requestFromQueue.url);
          const html = response.data;
          const $ = cheerio.load(html);

          const title = $("title").text();
          const links = $("a")
            .map((_, el) => {
              const linkValid = $(el).attr("href");
              if (linkValid?.includes("http")) {
                return linkValid;
              }
            })
            .get();

          let currentScrapedData = {
            title,
            depth: requestFromQueue.depth,
            url: requestFromQueue.url,
            links,
          };
          scrapedData.push(currentScrapedData);

          visited.add(requestFromQueue.url);
          const unvisitedLinks = links.filter((link) => !visited.has(link));
          const newDepth = requestFromQueue.depth + 1;

          for (const link of unvisitedLinks) {
            queue.push({
              url: link,
              depth: newDepth,
            });
          }
          setDataToRedis(scrapedData);
        }
      } else break;
    }
    console.log(scrapedData);
    console.log("Scrapping job completed and data stored in Redis.");
  } catch (err) {
    console.error("Error processing message:", err);
  }
};
