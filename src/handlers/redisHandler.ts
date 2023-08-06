import redisClient from "../db/redisdb";

export interface ScrapeItem {
  title: string;
  depth: number;
  url: string;
  links: string[];
}


export async function setDataToRedis(scrapedData: ScrapeItem[]) {
  try {
    console.log(scrapedData);
    const message = JSON.stringify(scrapedData);
    redisClient.publish("crawler-jobs", message);
  } catch (err) {
    throw new Error(err?.toString());
  }
}
