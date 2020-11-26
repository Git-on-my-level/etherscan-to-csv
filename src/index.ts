import axios from "axios";
import { Parser } from "json2csv";
import * as fs from "fs";
import { start } from "repl";

interface tokenTransaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  from: string;
  contractAddress: string;
  to: string;
  value: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  transactionIndex: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  cumulativeGasUsed: string;
  input: string;
  confirmations: string;
}

/*
 * Note: Etherscan paging logic does not work as expected, page=2 offset=10000 tries to fetch 20000 records instead of 10000 records starting on page 2
 * We use blocks as a workaround for now
 */
const fetchAllData = async (
  apiKey: string,
  tokenAddress: string,
  startBlock: number,
  endBlock: number
): Promise<tokenTransaction[]> => {
  let currentBlock = startBlock;
  const blockIncrement = 50000; // TODO make this configurable
  let transactionsList = new Array<tokenTransaction>();
  while (currentBlock < endBlock) {
    const queryStart = currentBlock;
    const queryEnd = Math.min(currentBlock + blockIncrement, endBlock);
    const response = await axios.get(
      `https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=${tokenAddress}&startblock=${queryStart}&endblock=${queryEnd}&sort=dsc&apikey=${apiKey}`
    );
    currentBlock += blockIncrement;
    const newTransactions: tokenTransaction[] = response.data.result;
    if (!response.data || !response.data.result) {
      console.log("Unexpected response format");
      console.log(response.data);
      break;
    }
    transactionsList = transactionsList.concat(newTransactions);
    console.log(`Rows fetched: ${newTransactions.length}`);
    console.log(
      `Latest timestamp: ${new Date(
        Number(newTransactions[0].timeStamp) * 1000 // convert from seconds to milliseconds
      )}`
    );
  }
  console.log("Done fetching");

  return transactionsList;
};

const exportToCSV = (content: any[]) => {
  const parser = new Parser({
    quote: "",
    fields: [
      "blockNumber",
      "timeStamp",
      "hash",
      "nonce",
      "blockHash",
      "from",
      "contractAddress",
      "to",
      "value",
      "tokenName",
      "tokenSymbol",
      "tokenDecimal",
      "transactionIndex",
      "gas",
      "gasPrice",
      "gasUsed",
      "cumulativeGasUsed",
      "input",
      "confirmations",
    ],
  });
  const csv = parser.parse(content);
  console.log("Writing to csv");
  fs.writeFile("extract.csv", csv, function (err) {
    if (err) console.error(err);
    console.log("Done");
  });
};

const main = async () => {
  const args = process.argv.slice(2);
  if (args.length != 3) {
    console.log(
      "Usage: yarn extract <token address> <starting block> <ending block>"
    );
    process.exit(0);
  }
  const tokenAddress = args[0];
  const startingBlock = Number(args[1]);
  const endingBlock = Number(args[2]);

  let transactionsList = await fetchAllData(
    process.env.ETHERSCAN_API_KEY,
    tokenAddress,
    startingBlock,
    endingBlock
  );
  exportToCSV(transactionsList);
};

main();
