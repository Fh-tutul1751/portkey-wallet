import { request } from '@portkey-wallet/api/api-did';
import { useCheckTransferLimit } from '@portkey-wallet/hooks/hooks-ca/security';
import { useCurrentWallet, useCurrentWalletInfo, useOriginChainId } from '@portkey-wallet/hooks/hooks-ca/wallet';
import { IPaymentSecurityItem } from '@portkey-wallet/types/types-ca/paymentSecurity';
import { handleErrorMessage } from '@portkey-wallet/utils';
import { Image, message } from 'antd';
import { SecurityVulnerabilityTip, SecurityVulnerabilityTitle } from 'constants/security';
import {
  useDailyTransferLimitModal,
  useSingleTransferLimitModal,
} from 'pages/WalletSecurity/PaymentSecurity/hooks/useLimitModal';
import CustomModal from 'pages/components/CustomModal';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { ExtensionContractBasic } from 'utils/sandboxUtil/ExtensionContractBasic';
import aes from '@portkey-wallet/utils/aes';
import { useCurrentChain } from '@portkey-wallet/hooks/hooks-ca/chainList';
import { useLoading, useUserInfo } from 'store/Provider/hooks';
import { ChainId } from '@portkey/provider-types';

export const useCheckSecurity = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const wallet = useCurrentWalletInfo();
  const { setLoading } = useLoading();

  return useCallback(async (): Promise<boolean | object> => {
    try {
      setLoading(true);
      const res: { isSafe: boolean } = await request.security.balanceCheck({
        params: { caHash: wallet?.caHash || '' },
      });

      setLoading(false);

      if (res?.isSafe) return true;

      return CustomModal({
        type: 'confirm',
        content: (
          <div className="security-modal">
            <Image
              width={180}
              height={108}
              src="assets/images/securityTip.png"
              className="modal-logo"
              preview={false}
            />
            <div className="modal-title">{SecurityVulnerabilityTitle}</div>
            <div>{SecurityVulnerabilityTip}</div>
          </div>
        ),
        cancelText: t('Not Now'),
        okText: t('Add Guardians'),
        onOk: () => navigate('/setting/guardians'),
      });
    } catch (error) {
      setLoading(false);
      const msg = handleErrorMessage(error, 'Balance Check Error');
      throw message.error(msg);
    }
  }, [navigate, setLoading, t, wallet?.caHash]);
};

export interface ICheckLimitParams {
  chainId: ChainId;
  symbol: string;
  decimals: number | string;
  amount: string;
}

export const useCheckLimit = () => {
  const originChainId = useOriginChainId();
  const currentChain = useCurrentChain(originChainId);
  const { walletInfo } = useCurrentWallet();
  const { passwordSeed } = useUserInfo();
  const checkTransferLimit = useCheckTransferLimit();
  const dailyTransferLimitModal = useDailyTransferLimitModal();
  const singleTransferLimitModal = useSingleTransferLimitModal();

  return useCallback(
    async ({ chainId, symbol, decimals, amount }: ICheckLimitParams): Promise<boolean | object> => {
      const privateKey = aes.decrypt(walletInfo.AESEncryptPrivateKey, passwordSeed);
      if (!currentChain?.endPoint || !privateKey) return message.error('remove manage error');

      const caContract = new ExtensionContractBasic({
        rpcUrl: currentChain?.endPoint,
        contractAddress: currentChain?.caContractAddress,
        privateKey: privateKey,
      });

      const limitRes = await checkTransferLimit({
        caContract,
        symbol,
        decimals,
        amount,
      });

      const settingParams: IPaymentSecurityItem = {
        chainId: chainId,
        symbol,
        singleLimit: limitRes?.singleBalance.toString() || '',
        dailyLimit: limitRes?.dailyLimit.toString() || '',
        restricted: !limitRes?.dailyLimit.eq(-1),
        decimals,
      };
      if (limitRes?.isSingleLimited) {
        return singleTransferLimitModal(settingParams);
      }
      if (limitRes?.isDailyLimited) {
        return dailyTransferLimitModal(settingParams);
      }
      return true;
    },
    [
      checkTransferLimit,
      currentChain?.caContractAddress,
      currentChain?.endPoint,
      dailyTransferLimitModal,
      passwordSeed,
      singleTransferLimitModal,
      walletInfo.AESEncryptPrivateKey,
    ],
  );
};