import { ZERO } from '@portkey-wallet/constants/misc';
import ramp, {
  IGetCryptoDataRequest,
  IGetLimitRequest,
  IGetExchangeRequest,
  IGetBuyPriceRequest,
  IGetBuyDetailRequest,
  IGetFiatDataRequest,
  IGetSellPriceRequest,
  IGetSellDetailRequest,
  IGetSellTransactionRequest,
  IGetOrderNoRequest,
} from '@portkey-wallet/ramp';
import { IRampLimit } from '@portkey-wallet/types/types-ca/ramp';
import BigNumber from 'bignumber.js';

// ======== buy ========
export const getBuyCrypto = async (params: Required<IGetCryptoDataRequest>) => {
  const {
    data: { cryptoList, defaultCrypto },
  } = await ramp.service.getBuyCryptoData(params);
  return { buyCryptoList: cryptoList, buyDefaultCrypto: defaultCrypto };
};

export const getBuyLimit = async (params: IGetLimitRequest): Promise<IRampLimit> => {
  const {
    data: {
      fiat: { symbol, minLimit, maxLimit },
    },
  } = await ramp.service.getBuyLimit(params);
  return {
    symbol,
    minLimit: Number(ZERO.plus(minLimit).decimalPlaces(4, BigNumber.ROUND_UP).valueOf()),
    maxLimit: Number(ZERO.plus(maxLimit).decimalPlaces(4, BigNumber.ROUND_DOWN).valueOf()),
  };
};

export const getBuyExchange = async (params: IGetExchangeRequest) => {
  const {
    data: { exchange },
  } = await ramp.service.getBuyExchange(params);
  return exchange;
};

export const getBuyPrice = async (params: IGetBuyPriceRequest) => {
  const {
    data: { cryptoAmount, exchange, feeInfo },
  } = await ramp.service.getBuyPrice(params);
  return { cryptoAmount, exchange, feeInfo };
};

export const getBuyDetail = async (params: IGetBuyDetailRequest) => {
  const {
    data: { providersList },
  } = await ramp.service.getBuyDetail(params);
  return providersList;
};

// ======== sell ========
export const getSellFiat = async (params: Required<IGetFiatDataRequest>) => {
  const {
    data: { fiatList, defaultFiat },
  } = await ramp.service.getSellFiatData(params);

  return { sellFiatList: fiatList, sellDefaultFiat: defaultFiat };
};

export const getSellLimit = async (params: IGetLimitRequest): Promise<IRampLimit> => {
  const {
    data: {
      crypto: { symbol, minLimit, maxLimit },
    },
  } = await ramp.service.getSellLimit(params);
  return {
    symbol,
    minLimit: Number(ZERO.plus(minLimit).decimalPlaces(4, BigNumber.ROUND_UP).valueOf()),
    maxLimit: Number(ZERO.plus(maxLimit).decimalPlaces(4, BigNumber.ROUND_DOWN).valueOf()),
  };
};

export const getSellExchange = async (params: IGetExchangeRequest) => {
  const {
    data: { exchange },
  } = await ramp.service.getSellExchange(params);
  return exchange;
};

export const getSellPrice = async (params: IGetSellPriceRequest) => {
  const {
    data: { fiatAmount, exchange, feeInfo },
  } = await ramp.service.getSellPrice(params);
  return { fiatAmount, exchange, feeInfo };
};

export const getSellDetail = async (params: IGetSellDetailRequest) => {
  const {
    data: { providersList },
  } = await ramp.service.getSellDetail(params);
  return providersList;
};

export const sendSellTransaction = async (params: IGetSellTransactionRequest) => {
  await ramp.service.sendSellTransaction(params);
};

export const getOrderNo = async (params: IGetOrderNoRequest) => {
  const { data: orderNo } = await ramp.service.getOrderNo(params);
  return orderNo;
};