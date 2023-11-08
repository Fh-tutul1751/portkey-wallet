import {
  IAlchemyPayRampService,
  IBuyDetailResult,
  IBuyLimitResult,
  IBuyPriceResult,
  IGetAchPaySignatureRequest,
  IGetAchPaySignatureResult,
  IGetAchPayTokenRequest,
  IGetAchPayTokenResult,
  IGetBuyDetailRequest,
  IGetBuyPriceRequest,
  IGetCryptoDataRequest,
  IGetExchangeRequest,
  IGetFiatDataRequest,
  IGetLimitRequest,
  IGetOrderNoRequest,
  IGetOrderNoResult,
  IGetSellDetailRequest,
  IGetSellPriceRequest,
  IGetSellTransactionRequest,
  IRampCryptoResult,
  IRampExchangeResult,
  IRampFiatResult,
  IRampInfoResult,
  IRampService,
  IRampServiceCommon,
  IRampServiceOptions,
  ISellDetailResult,
  ISellLimitResult,
  ISellPriceResult,
} from '../types/services';
import RampApi from '../api';
import { RampType } from '../constants';
import { IClientType, IRampRequest } from '../types';

export class RampService implements IRampService {
  public baseUrl: string;
  public clientType: IClientType;
  public request: IRampRequest;

  constructor(options: IRampServiceOptions) {
    this.baseUrl = options?.baseUrl || '';
    this.clientType = options?.clientType || 'iOS';
    this.request = options?.request;
  }

  getRampInfo(): IRampServiceCommon<IRampInfoResult> {
    return this.request.send(this.baseUrl, {
      url: RampApi.getRampInfo.target,
      method: RampApi.getRampInfo.config.method,
      headers: {
        ClientType: this.clientType,
      },
    });
  }
  getBuyCryptoData(params?: IGetCryptoDataRequest): IRampServiceCommon<IRampCryptoResult> {
    return this.request.send(this.baseUrl, {
      url: RampApi.getCrypto.target,
      method: RampApi.getCrypto.config.method,
      params: { type: RampType.BUY, ...params },
    });
  }
  getBuyFiatData(params?: IGetFiatDataRequest): IRampServiceCommon<IRampFiatResult> {
    return this.request.send(this.baseUrl, {
      url: RampApi.getFiat.target,
      method: RampApi.getFiat.config.method,
      params: { type: RampType.BUY, ...params },
    });
  }
  getBuyLimit(params: IGetLimitRequest): IRampServiceCommon<IBuyLimitResult> {
    return this.request.send(this.baseUrl, {
      url: RampApi.getRampLimit.target,
      method: RampApi.getRampLimit.config.method,
      params: { type: RampType.BUY, ...params },
    });
  }
  getBuyExchange(params: IGetExchangeRequest): IRampServiceCommon<IRampExchangeResult> {
    return this.request.send(this.baseUrl, {
      url: RampApi.getRampExchange.target,
      method: RampApi.getRampExchange.config.method,
      params: { type: RampType.BUY, ...params },
    });
  }
  getBuyPrice(params: IGetBuyPriceRequest): IRampServiceCommon<IBuyPriceResult> {
    return this.request.send(this.baseUrl, {
      url: RampApi.getRampPrice.target,
      method: RampApi.getRampPrice.config.method,
      params: { type: RampType.BUY, ...params },
    });
  }
  getBuyDetail(params: IGetBuyDetailRequest): IRampServiceCommon<IBuyDetailResult> {
    return this.request.send(this.baseUrl, {
      url: RampApi.getRampDetail.target,
      method: RampApi.getRampDetail.config.method,
      params: { type: RampType.BUY, ...params },
    });
  }
  getSellCryptoData(params?: IGetCryptoDataRequest): IRampServiceCommon<IRampCryptoResult> {
    return this.request.send(this.baseUrl, {
      url: RampApi.getCrypto.target,
      method: RampApi.getCrypto.config.method,
      params: { type: RampType.SELL, ...params },
    });
  }
  getSellFiatData(params?: IGetFiatDataRequest): IRampServiceCommon<IRampFiatResult> {
    return this.request.send(this.baseUrl, {
      url: RampApi.getFiat.target,
      method: RampApi.getFiat.config.method,
      params: { type: RampType.SELL, ...params },
    });
  }
  getSellLimit(params: IGetLimitRequest): IRampServiceCommon<ISellLimitResult> {
    return this.request.send(this.baseUrl, {
      url: RampApi.getRampLimit.target,
      method: RampApi.getRampLimit.config.method,
      params: { type: RampType.SELL, ...params },
    });
  }
  getSellExchange(params: IGetExchangeRequest): IRampServiceCommon<IRampExchangeResult> {
    return this.request.send(this.baseUrl, {
      url: RampApi.getRampExchange.target,
      method: RampApi.getRampExchange.config.method,
      params: { type: RampType.SELL, ...params },
    });
  }
  getSellPrice(params: IGetSellPriceRequest): IRampServiceCommon<ISellPriceResult> {
    return this.request.send(this.baseUrl, {
      url: RampApi.getRampPrice.target,
      method: RampApi.getRampPrice.config.method,
      params: { type: RampType.SELL, ...params },
    });
  }
  getSellDetail(params: IGetSellDetailRequest): IRampServiceCommon<ISellDetailResult> {
    return this.request.send(this.baseUrl, {
      url: RampApi.getRampDetail.target,
      method: RampApi.getRampDetail.config.method,
      params: { type: RampType.SELL, ...params },
    });
  }
  sendSellTransaction(params: IGetSellTransactionRequest): IRampServiceCommon<any> {
    return this.request.send(this.baseUrl, {
      url: RampApi.sendSellTransaction.target,
      method: RampApi.sendSellTransaction.config.method,
      params,
    });
  }
  getOrderNo(params: IGetOrderNoRequest): IRampServiceCommon<IGetOrderNoResult> {
    return this.request.send(this.baseUrl, {
      url: RampApi.getOrderNo.target,
      method: RampApi.getOrderNo.config.method,
      params,
    });
  }
}

export class AlchemyPayRampService extends RampService implements IAlchemyPayRampService {
  public baseUrl: string;
  public clientType: IClientType;
  public request: IRampRequest;

  constructor(options: IRampServiceOptions) {
    super(options);
    this.baseUrl = options?.baseUrl || '';
    this.clientType = options?.clientType || 'iOS';
    this.request = options?.request;
  }

  getAchPayToken(params: IGetAchPayTokenRequest): IRampServiceCommon<IGetAchPayTokenResult> {
    return this.request.send(this.baseUrl, {
      url: RampApi.getAchPayToken.target,
      method: RampApi.getAchPayToken.config.method,
      params,
    });
  }
  getAchPaySignature(params: IGetAchPaySignatureRequest): IRampServiceCommon<IGetAchPaySignatureResult> {
    return this.request.send(this.baseUrl, {
      url: RampApi.getAchPaySignature.target,
      method: RampApi.getAchPaySignature.config.method,
      params,
    });
  }
}

export * from '../signalr';