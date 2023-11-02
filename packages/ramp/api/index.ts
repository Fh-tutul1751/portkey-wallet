export default {
  getRampInfo: {
    target: '/api/app/thirdPart/ramp/info',
    config: { method: 'GET' },
  },
  getCrypto: {
    target: '/api/app/thirdPart/ramp/crypto',
    config: { method: 'GET' },
  },
  getFiat: {
    target: '/api/app/thirdPart/ramp/fiat',
    config: { method: 'GET' },
  },
  getRampLimit: {
    target: '/api/app/thirdPart/ramp/limit',
    config: { method: 'GET' },
  },
  getRampExchange: {
    target: '/api/app/thirdPart/ramp/exchange',
    config: { method: 'GET' },
  },
  getRampPrice: {
    target: '/api/app/thirdPart/ramp/price',
    config: { method: 'GET' },
  },
  getRampDetail: {
    target: '/api/app/thirdPart/ramp/detail',
    config: { method: 'GET' },
  },
  sendSellTransaction: {
    target: '/api/app/thirdPart/ramp/transaction',
    config: { method: 'POST' },
  },
  getOrderNo: {
    target: '/api/app/thirdPart/order',
    config: { method: 'POST' },
  },
  getAchToken: {
    target: '/api/app/thirdPart/ramp/alchemy/token',
    config: { method: 'POST' },
  },
  getAchSignature: {
    target: '/api/app/thirdPart/ramp/alchemy/signature',
    config: { method: 'GET' },
  },
} as const;