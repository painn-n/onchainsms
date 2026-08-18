export const SUPPORTED_CHAINS = {
  4663: {
    name: "Robinhood Chain",
    explorerUrl: "https://robinhoodchain.blockscout.com",
  },
  8453: {
    name: "Base",
    explorerUrl: "https://base.blockscout.com",
  },
};

export const MESSAGE_SCHEMA = "onchain-sms:v1";

export const ONCHAIN_MESSAGE_PARAMS = [
  { name: "schema", type: "string" },
  { name: "recipient", type: "address" },
  { name: "message", type: "string" },
];
