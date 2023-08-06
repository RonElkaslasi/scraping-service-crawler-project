import AWS from "aws-sdk";
import { processScrapeRequest } from "./crawlerHandler";

AWS.config.update({ region: process.env.AWS_REGION });
const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });

export async function pollSQSQueue() {
  let i = 0;
  const params = {
    QueueUrl: process.env.QUEUE_URL || "",
    MaxNumberOfMessages: 10,
    WaitTimeSeconds: 20,
  };

  while (true) {
    i++;

    try {
      const data = await sqs.receiveMessage(params).promise();

      if (data.Messages) {
        for (const message of data.Messages) {
          await processScrapeRequest(message);
          await sqs
            .deleteMessage({
              QueueUrl: process.env.QUEUE_URL!,
              ReceiptHandle: message.ReceiptHandle!,
            })
            .promise();
        }
      }
    } catch (err) {
      console.error("Error receiving messages from SQS: ", err);
    }
  }
}
