import { message } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import qs from 'query-string';
import aes from '@portkey-wallet/utils/aes';
import { useCurrentChain } from '@portkey-wallet/hooks/hooks-ca/chainList';
import { useCurrentNetworkInfo } from '@portkey-wallet/hooks/hooks-ca/network';
import { useCurrentWallet, useOriginChainId } from '@portkey-wallet/hooks/hooks-ca/wallet';
import { useGuardiansInfo, useLoading, useUserInfo } from 'store/Provider/hooks';
import { contractErrorHandler } from 'utils/tryErrorHandler';
import { formatGuardianValue } from '../utils/formatGuardianValue';
import { IPaymentSecurityItem } from '@portkey-wallet/types/types-ca/paymentSecurity';
import { timesDecimals } from '@portkey-wallet/utils/converter';
import { setTransferLimit } from 'utils/sandboxUtil/setTransferLimit';
import ModalTip from 'pages/components/ModalTip';
import { sleep } from '@portkey-wallet/utils';

export const useSetTransferLimit = () => {
  const { setLoading } = useLoading();
  const { walletInfo } = useCurrentWallet();
  const { passwordSeed } = useUserInfo();

  const originChainId = useOriginChainId();
  const currentChain = useCurrentChain(originChainId);
  const { state, search } = useLocation();
  const navigate = useNavigate();
  const currentNetwork = useCurrentNetworkInfo();
  const { userGuardianStatus } = useGuardiansInfo();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (search) {
      const { detail } = qs.parse(search);
      setQuery(detail);
    } else {
      setQuery(state);
    }
  }, [query, search, state]);

  return useCallback(async () => {
    try {
      setLoading(true);

      const privateKey = aes.decrypt(walletInfo.AESEncryptPrivateKey, passwordSeed);
      if (!currentChain?.endPoint || !privateKey) return message.error('remove manage error');
      const { guardiansApproved } = formatGuardianValue(userGuardianStatus);
      const transQuery: IPaymentSecurityItem = JSON.parse(query.split('_')[1]);
      const symbol = transQuery?.symbol;
      const dailyLimit = transQuery?.restricted
        ? timesDecimals(transQuery.dailyLimit, transQuery.decimals).toNumber()
        : -1;
      const singleLimit = transQuery?.restricted
        ? timesDecimals(transQuery.singleLimit, transQuery.decimals).toNumber()
        : -1;

      await setTransferLimit({
        rpcUrl: currentChain.endPoint,
        chainType: currentNetwork.walletType,
        address: currentChain.caContractAddress,
        privateKey,
        paramsOption: {
          caHash: walletInfo?.caHash as string,
          symbol,
          dailyLimit,
          singleLimit,
          guardiansApproved,
        },
      });

      setLoading(false);
      ModalTip({
        content: 'Requested successfully',
        onClose: async () => {
          await sleep(1000);
          navigate('/setting/wallet-security/payment-security/transfer-settings', {
            state: { ...transQuery, dailyLimit, singleLimit },
          });
        },
      });
    } catch (error: any) {
      setLoading(false);

      const _error = contractErrorHandler(error) || 'Try again later';
      message.error(_error);
    }
  }, [
    currentChain?.caContractAddress,
    currentChain?.endPoint,
    currentNetwork.walletType,
    navigate,
    passwordSeed,
    query,
    setLoading,
    userGuardianStatus,
    walletInfo.AESEncryptPrivateKey,
    walletInfo?.caHash,
  ]);
};