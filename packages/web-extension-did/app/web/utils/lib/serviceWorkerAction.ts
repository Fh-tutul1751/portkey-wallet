import { NetworkType } from '@portkey-wallet/types';
import { ISocialLogin } from '@portkey-wallet/types/types-ca/wallet';
import { sleep } from '@portkey-wallet/utils';
import { message } from 'antd';
import InternalMessage from 'messages/InternalMessage';
import InternalMessageTypes, { PortkeyMessageTypes } from 'messages/InternalMessageTypes';
import { useCallback } from 'react';
import { CloseParams } from 'service/NotificationService';
import { CreatePromptType, ReCaptchaResponseParams, SendResponseParams } from 'types';
import { getPortkeyFinanceUrl } from 'utils';
import { getWalletState } from './SWGetReduxStore';
import { apis } from 'utils/BrowserApis';

export const timeout = async (timer = 2000) => {
  await sleep(timer);
  return 'Chrome service worker is not working';
};

export const closeTabPrompt = async (closeParams: CloseParams) => {
  if (!closeParams?.windowId) {
    const tab = await apis.tabs.getCurrent();
    closeParams.windowId = tab?.id;
  }
  return closePrompt(closeParams, 'tabs');
};

export const closePrompt = async (closeParams?: CloseParams, promptType?: CreatePromptType) => {
  // await DappMiddle.middle
  await sleep(100);
  return InternalMessage.payload(PortkeyMessageTypes.CLOSE_PROMPT, {
    promptType,
    closeParams,
    isClose: true,
  }).send();
};

export const useLockWallet = () => {
  return useCallback(async () => {
    try {
      await InternalMessage.payload(PortkeyMessageTypes.LOCK_WALLET).send();
    } catch (error) {
      message.error('Lock error');
    }
  }, []);
};

export const activeLockStatusAction = async () => {
  const res = await Promise.race([InternalMessage.payload(PortkeyMessageTypes.ACTIVE_LOCK_STATUS).send(), timeout()]);
  console.log(res, 'Check ACTIVE_LOCK_STATUS');
  if (typeof res === 'string') return chrome.runtime.reload();
};

export const setPinAction = (pin: string) => InternalMessage.payload(PortkeyMessageTypes.SET_SEED, pin).send();

export const socialLoginAction = async (type: ISocialLogin, network: NetworkType): Promise<SendResponseParams> => {
  const { JOIN_AUTH_URL, JOIN_TELEGRAM_URL } = getPortkeyFinanceUrl(network);
  let externalLink = `${JOIN_AUTH_URL}/${network}/${type}`;
  if (type === 'Telegram') {
    externalLink = JOIN_TELEGRAM_URL;
  }
  return await InternalMessage.payload(PortkeyMessageTypes.SOCIAL_LOGIN, {
    externalLink,
  }).send();
};

export const reCAPTCHAAction = async (): Promise<ReCaptchaResponseParams> => {
  const wallet = await getWalletState();
  const { RECAPTCHA_URL } = getPortkeyFinanceUrl(wallet.currentNetwork);
  return await InternalMessage.payload(PortkeyMessageTypes.OPEN_RECAPTCHA_PAGE, {
    externalLink: `${RECAPTCHA_URL}`,
  }).send();
};

export const getPin = async () => {
  const getSeedResult = await InternalMessage.payload(InternalMessageTypes.GET_SEED).send();
  const pin = getSeedResult.data.privateKey;
  return pin;
};
