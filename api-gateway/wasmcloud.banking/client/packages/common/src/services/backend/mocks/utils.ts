const API_V2_ENABLED = new URLSearchParams(window.location.search).get('api') === 'v2';

function log(...args: unknown[]) {
  if (!API_V2_ENABLED) console.log('[api]', ...args);
}

function hasFeature(feature: string) {
  return new URLSearchParams(window.location.search).getAll('feat').includes(feature);
}

function secondsBetween(min: number, max: number) {
  return (Math.floor(Math.random() * max) + min) * 1000;
}

export {log, hasFeature, secondsBetween, API_V2_ENABLED};
