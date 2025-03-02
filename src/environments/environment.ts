// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  walletUrl: 'https://walleteos.com',
  votingUrl: 'http://yas.yastoken.io',
  appName: 'YAS Tracker',
  logoUrl: '/assets/logo.png',
  blockchainUrl: 'http://iyas.top:8888',
  chainId: 'EOS7oB3Ruwavbvja9SQpN58iK2zK8W737E6hvUwXUUj9iQ5a49Tff',
  showAds: false,
  tokensUrl: 'https://raw.githubusercontent.com/eoscafe/eos-airdrops/master/tokens.json',
  tickerUrl: '/api/whaleex/BUSINESS/api/public/v1/ticker/yaseos',
  token: 'EOS'
};
