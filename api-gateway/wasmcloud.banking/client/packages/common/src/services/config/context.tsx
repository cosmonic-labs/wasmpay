import React from 'react';

export type ConfigResponse = {
  baseUrl: string;
  appName: string;
  apiPaths: {
    transactions: string;
    createUser: string;
  };
};

const DEFAULT_CONFIG: ConfigResponse = {
  baseUrl: '/',
  appName: 'wasmCloud Banking',
  apiPaths: {
    transactions: '/accounts/:id/transactions',
    createUser: '/accounts/:id',
  },
};

const ConfigContext = React.createContext<ConfigResponse | undefined>(undefined);

const mergeConfig = (config: ConfigResponse) => {
  return {
    ...DEFAULT_CONFIG,
    ...config,
    apiPaths: {...DEFAULT_CONFIG.apiPaths, ...config.apiPaths},
  };
};

function getConfigJson(): {read: () => ConfigResponse} {
  let response: ConfigResponse | undefined = undefined;
  const promise = fetch('/config.json')
    .then((res) => res.json() as Promise<ConfigResponse>)
    .then((res) => (response = res))
    .catch((err) => {
      console.error('Failed to load config.json:', err);
      response = DEFAULT_CONFIG;
    });

  return {
    read: () => {
      if (typeof response !== 'undefined') return mergeConfig(response);
      throw promise;
    },
  };
}

const configLoader = getConfigJson();

function ConfigProvider({children}: React.PropsWithChildren) {
  const config = configLoader.read();

  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
}

export {ConfigContext, ConfigProvider};
