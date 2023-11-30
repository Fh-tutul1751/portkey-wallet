import { PaymentTypeEnum } from '@portkey-wallet/types/types-ca/payment';
import { useCallback, useMemo } from 'react';
import navigationService from 'utils/navigationService';
import { useAppBridgeButtonShow, useAppBuyButtonShow, useAppETransShow } from './cms';
import { useCurrentNetworkInfo } from '@portkey-wallet/hooks/hooks-ca/network';
import { useDisclaimer } from '@portkey-wallet/hooks/hooks-ca/disclaimer';
import { useSecuritySafeCheckAndToast } from './security';
import Loading from 'components/Loading';
import DisclaimerModal from 'components/DisclaimerModal';
import CommonToast from 'components/CommonToast';
import { getUrlObj } from '@portkey-wallet/utils/dapp/browser';
import { IconName } from 'components/Svg';
import { stringifyETrans } from '@portkey-wallet/utils/dapp/url';

export type DepositItem = {
  title: string;
  icon: IconName;
  description: string;
  onPress: () => void;
};

const DepositMap = {
  buy: {
    title: 'Buy Crypto',
    icon: 'buy2',
    description: 'Buy crypto using fiat currency',
    onPress: () => navigationService.navigate('BuyHome', { toTab: PaymentTypeEnum.BUY }),
  },
  sell: {
    title: 'Sell Crypto',
    icon: 'sell',
    description: 'Sell crypto for fiat currency',
    onPress: () => navigationService.navigate('BuyHome', { toTab: PaymentTypeEnum.SELL }),
  },
  depositUSDT: {
    title: 'Deposit USDT',
    icon: 'deposit',
    description: 'Receive USDT from other chains',
    onPress: () => {
      // rewrite onPress
    },
  },
  withdrawUSDT: {
    title: 'Withdraw USDT',
    icon: 'withdraw',
    description: 'Send USDT to other chains',
    onPress: () => {
      // rewrite onPress
    },
  },
  bridge: {
    title: 'Cross-Chain Bridge',
    icon: 'bridge',
    description: 'Make cross-chain transfers',
    onPress: () => {
      // rewrite onPress
    },
  },
};

export type ModalDescribe = {
  title: string;
  description: string;
};

export const DepositModalMap: { [key: string]: ModalDescribe } = {
  bridge: {
    title: 'eBridge',
    description: 'You will be directed to a third-party DApp: eBridge',
  },
  depositUSDT: {
    title: 'ETransfer',
    description: 'You will be directed to a third-party DApp: ETransfer',
  },
  withdrawUSDT: {
    title: 'ETransfer',
    description: 'You will be directed to a third-party DApp: ETransfer',
  },
};

export function useOnDisclaimerModalPress() {
  const { checkDappIsConfirmed } = useDisclaimer();
  const securitySafeCheckAndToast = useSecuritySafeCheckAndToast();

  return useCallback(
    async (modalDescribe: ModalDescribe, url: string) => {
      console.log(modalDescribe, url);

      try {
        const { origin } = getUrlObj(url);
        Loading.show();
        if (!(await securitySafeCheckAndToast())) return;
        if (!checkDappIsConfirmed(origin))
          return DisclaimerModal.showDisclaimerModal({
            ...modalDescribe,
            url,
          });
        navigationService.navigate('ProviderWebPage', { title: modalDescribe.title, url });
      } catch (error) {
        CommonToast.failError(error);
      } finally {
        Loading.hide();
      }
    },
    [checkDappIsConfirmed, securitySafeCheckAndToast],
  );
}

export function useDepositList() {
  const { isBuyButtonShow, isSellSectionShow } = useAppBuyButtonShow();
  const { isBridgeShow } = useAppBridgeButtonShow();
  const { isETransDepositShow, isETransWithdrawShow } = useAppETransShow();

  const { eBridgeUrl, eTransUrl } = useCurrentNetworkInfo();

  const onDisclaimerModalPress = useOnDisclaimerModalPress();
  return useMemo(() => {
    const list = [];
    if (isBuyButtonShow) list.push(DepositMap.buy);
    if (isSellSectionShow) list.push(DepositMap.sell);
    if (isETransDepositShow)
      list.push({
        ...DepositMap.depositUSDT,
        onPress: () =>
          onDisclaimerModalPress(
            DepositModalMap.depositUSDT,
            stringifyETrans({
              url: eTransUrl || '',
              query: {
                tokenSymbol: 'USDT',
                type: 'Deposit',
              },
            }),
          ),
      });
    if (isETransWithdrawShow) {
      list.push({
        ...DepositMap.withdrawUSDT,
        onPress: () =>
          onDisclaimerModalPress(
            DepositModalMap.withdrawUSDT,
            stringifyETrans({
              url: eTransUrl || '',
              query: {
                tokenSymbol: 'USDT',
                type: 'Withdraw',
              },
            }),
          ),
      });
    }
    if (isBridgeShow)
      list.push({
        ...DepositMap.bridge,
        onPress: () => onDisclaimerModalPress(DepositModalMap.bridge, eBridgeUrl || ''),
      });

    return list;
  }, [
    eBridgeUrl,
    eTransUrl,
    isBridgeShow,
    isBuyButtonShow,
    isETransDepositShow,
    isETransWithdrawShow,
    isSellSectionShow,
    onDisclaimerModalPress,
  ]);
}
