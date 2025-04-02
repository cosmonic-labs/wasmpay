import {useConfig} from '#services/config/useConfig.ts';

type ApiServices = typeof import('../api').default;

function loadApi() {
  const params = new URLSearchParams(window.location.search);
  let response: ApiServices | undefined = undefined;
  const api = params.get('api') || 'default';
  console.log('Using API:', api);

  const promise = Promise.resolve(import('#services/backend/api/index.ts')).then(
    (res) => (response = res.default),
  );

  return {
    load() {
      if (response === undefined) throw promise;

      return response;
    },
  };
}

const apiLoader = loadApi();

function useApi() {
  const config = useConfig();

  const api = apiLoader.load();

  return {
    postChat: api.postChat(config),
    listBanks: api.listBanks(config),
    getBanksById: api.getBankById(config),
    getBanksByCode: api.getBankByCode(config),
    transactions: api.transactions(config),
    createTransaction: api.createTransaction(config),
  };
}

export {useApi};
