import path from "path";
import fs from "fs";

export interface Config {
  nicehash: {
    apiKey: string;
    apiSecret: string;
    orgId: string;
  }
}

export function loadConfig() {
  return new Promise<Config>((resolve) => {
    Promise.resolve(
      JSON.parse(
        fs.readFileSync(
          path.resolve(__dirname, "..", "config.json"),
          "utf8"
        )
      )
    ).then((read) => {
      resolve(read);
    });
  });
}
