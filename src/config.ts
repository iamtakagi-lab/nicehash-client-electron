import Store from "electron-store";

export interface Config {
  nicehash: {
    apiKey: string;
    apiSecret: string;
    orgId: string;
  }
  gpuDeviceBrand: "NVIDIA" | "AMD"
};

export function loadConfig() {
  const store = new Store<Config>({
    defaults: {
      nicehash: {
        apiKey: "",
        apiSecret: "",
        orgId: "",
      },
      gpuDeviceBrand: "NVIDIA"
    }
  })
  return new Promise<Config>((resolve) => {
    resolve({
        nicehash: {
          apiKey: store.get("nicehash.apiKey"),
          apiSecret: store.get("nicehash.apiSecret"),
          orgId: store.get("nicehash.orgId"),
        },
        gpuDeviceBrand: store.get("gpuDeviceBrand"),
      }
    )
  })
}
