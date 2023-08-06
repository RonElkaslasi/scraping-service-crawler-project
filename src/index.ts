import { pollSQSQueue } from "./handlers/sqsHandler";

const main = () => {
  console.log("Connected");

  pollSQSQueue().catch((err) => console.error("Error in pollSQSQueue: ", err));
};

main();
