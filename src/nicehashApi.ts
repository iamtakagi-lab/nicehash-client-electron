import axios, { AxiosError } from "axios";
import { createHmac, randomBytes } from "crypto";
import { Config } from "./config";
import { stringify } from "querystring";

const APP_NAME = "nicehash" as const;
const APP_VERSION = "1.0.2" as const;
const NICEHASH_API_HOST = "https://api2.nicehash.com" as const;
const USER_AGENT =
  `${APP_NAME}/${APP_VERSION} (+https://github.com/iamtakagi/nicehash)` as const;


export declare module NicehashRigs {
  interface MinerStatuses {
    MINING: number;
  }

  interface RigTypes {
    MANAGED: number;
  }

  interface DevicesStatuses {
    MINING: number;
    DISABLED: number;
  }

  interface DeviceType {
    enumName: string;
    description: string;
  }

  interface Status {
    enumName: string;
    description: string;
  }

  interface PowerMode {
    enumName: string;
    description: string;
  }

  interface Speed {
    algorithm: string;
    title: string;
    speed: string;
    displaySuffix: string;
  }

  interface Intensity {
    enumName: string;
    description: string;
  }

  interface Device {
    id: string;
    name: string;
    deviceType: DeviceType;
    status: Status;
    temperature: number;
    load: number;
    revolutionsPerMinute: number;
    revolutionsPerMinutePercentage: number;
    powerMode: PowerMode;
    powerUsage: number;
    speeds: Speed[];
    intensity: Intensity;
    nhqm: string;
  }

  interface Algorithm {
    enumName: string;
    description: string;
  }

  interface Stat {
    statsTime: number;
    market: string;
    algorithm: Algorithm;
    unpaidAmount: string;
    difficulty: number;
    proxyId: number;
    timeConnected: number;
    xnsub: boolean;
    speedAccepted: number;
    speedRejectedR1Target: number;
    speedRejectedR2Stale: number;
    speedRejectedR3Duplicate: number;
    speedRejectedR4NTime: number;
    speedRejectedR5Other: number;
    speedRejectedTotal: number;
    profitability: number;
  }

  interface MiningRig {
    rigId: string;
    type: string;
    name: string;
    statusTime: number;
    joinTime: number;
    minerStatus: string;
    groupName: string;
    unpaidAmount: string;
    softwareVersions: string;
    devices: Device[];
    cpuMiningEnabled: boolean;
    cpuExists: boolean;
    stats: Stat[];
    profitability: number;
    localProfitability: number;
    rigPowerMode: string;
  }

  interface Pagination {
    size: number;
    page: number;
    totalPageCount: number;
  }

  interface RootObject {
    minerStatuses: MinerStatuses;
    rigTypes: RigTypes;
    totalRigs: number;
    totalProfitability: number;
    groupPowerMode: string;
    totalDevices: number;
    devicesStatuses: DevicesStatuses;
    unpaidAmount: string;
    path: string;
    btcAddress: string;
    nextPayoutTimestamp: string;
    lastPayoutTimestamp: string;
    miningRigGroups: any[];
    miningRigs: MiningRig[];
    rigNhmVersions: string[];
    externalAddress: boolean;
    totalProfitabilityLocal: number;
    pagination: Pagination;
  }
}

function createSignature(
    method: string,
    endpoint: string,
    time: number,
    nonce: string,
    { apiKey, apiSecret, orgId}: Config["nicehash"],
    query: string | Record<any, any> | null = null,
    body: string | object | null = null,
  ) {
    const hmac = createHmac("sha256", apiSecret);
  
    hmac.update(
      `${apiKey}\0${time}\0${nonce}\0\0${orgId}\0\0${method.toUpperCase()}\0${endpoint}\0`
    );
  
    if (query)
      hmac.update(`${typeof query === "object" ? stringify(query) : query}`);
    if (body)
      hmac.update(`\0${typeof body === "object" ? JSON.stringify(body) : body}`);
  
    return `${apiKey}:${hmac.digest("hex")}`;
  }
  
export function getRigs({ apiKey, apiSecret, orgId}: Config["nicehash"]) {
    const client = axios.create({
      baseURL: NICEHASH_API_HOST,
    });
    const date = Date.now();
    const nonce = randomBytes(16).toString("base64");
  
    return new Promise<NicehashRigs.RootObject>((resolve, reject) =>
      client
        .get<NicehashRigs.RootObject>(`/main/api/v2/mining/rigs2`, {
          responseType: "json",
          headers: {
            "X-Time": date,
            "X-Nonce": nonce,
            "X-Organization-Id": orgId,
            "X-Request-Id": nonce,
            "X-User-Agent": USER_AGENT,
            "X-User-Lang": "ja",
            "X-Auth": createSignature(
              "GET",
              `/main/api/v2/mining/rigs2`,
              date,
              nonce,
              { apiKey, apiSecret, orgId }
            ),
          },
        })
        .then(({ data }) => {
          resolve(data);
        })
        .catch((err) => {
          throw err as AxiosError;
        })
    );
  }