import { BaseToken } from '@portkey-wallet/types/types-ca/token';
import { divDecimals, formatAmountShow } from '@portkey-wallet/utils/converter';
import { Button, Input } from 'antd';
import clsx from 'clsx';
import { handleKeyDown } from 'pages/Send/utils/util.keyDown';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getBalance } from 'utils/sandboxUtil/getBalance';
import { useCurrentChain } from '@portkey-wallet/hooks/hooks-ca/chainList';
import { ChainId } from '@portkey-wallet/types';
import { useCurrentNetworkInfo, useIsTestnet } from '@portkey-wallet/hooks/hooks-ca/network';
import { ELF_SYMBOL } from '@portkey-wallet/constants/constants-ca/assets';
import CustomSvg from 'components/CustomSvg';
import { useAmountInUsdShow, useGetCurrentAccountTokenPrice } from '@portkey-wallet/hooks/hooks-ca/useTokensPrice';
import { useCheckManagerSyncState } from 'hooks/wallet';

export default function TokenInput({
  fromAccount,
  token,
  value,
  errorMsg,
  onChange,
  setErrorMsg,
}: {
  fromAccount: { address: string; AESEncryptPrivateKey: string };
  toAccount: { address: string };
  token: BaseToken;
  value: string;
  errorMsg: string;
  onChange: (params: { amount: string; balance: string }) => void;
  getTranslationInfo: (num: string) => any;
  setErrorMsg: (v: string) => void;
}) {
  const currentNetwork = useCurrentNetworkInfo();
  const currentChain = useCurrentChain(token.chainId as ChainId);
  const isTestNet = useIsTestnet();
  const { t } = useTranslation();
  const [amount, setAmount] = useState<string>(value ? `${value} ${token.symbol}` : '');
  const [balance, setBalance] = useState<string>('');
  const [, getTokenPrice] = useGetCurrentAccountTokenPrice();
  const amountInUsdShow = useAmountInUsdShow();
  const checkManagerSyncState = useCheckManagerSyncState();
  const [isManagerSynced, setIsManagerSynced] = useState(true);

  const amountInUsd = useMemo(
    () => amountInUsdShow(value || amount, 0, token.symbol),
    [amount, amountInUsdShow, token.symbol, value],
  );

  useEffect(() => {
    getTokenPrice(token.symbol);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getTokenBalance = useCallback(async () => {
    if (!currentChain) return;
    const result = await getBalance({
      rpcUrl: currentChain.endPoint,
      address: token.address,
      chainType: currentNetwork.walletType,
      paramsOption: {
        owner: fromAccount.address,
        symbol: token.symbol,
      },
    });
    const balance = result.result.balance;
    setBalance(balance);
    console.log(result, currentChain, 'balances==getTokenBalance=');
  }, [currentChain, currentNetwork.walletType, fromAccount.address, token.address, token.symbol]);

  useEffect(() => {
    getTokenBalance();
  }, [getTokenBalance]);

  const handleAmountBlur = useCallback(() => {
    onChange({ amount, balance });
  }, [amount, balance, onChange]);

  const handleMax = useCallback(async () => {
    const _isManagerSynced = await checkManagerSyncState(token.chainId);
    setIsManagerSynced(_isManagerSynced);
    if (_isManagerSynced) {
      const _amount = divDecimals(balance, token.decimals).toFixed();
      setAmount(_amount);
      onChange({ amount: _amount, balance });
      setErrorMsg('');
    } else {
      setErrorMsg('Synchronizing on-chain account information...');
    }
  }, [balance, checkManagerSyncState, onChange, setErrorMsg, token.chainId, token.decimals]);

  return (
    <div className="amount-wrap">
      <div className="item asset">
        <span className="label">{t('Asset_with_colon')}</span>
        <div className="control">
          <div className="asset-selector">
            <div className="icon">
              {token.symbol === ELF_SYMBOL ? (
                <CustomSvg className="token-logo" type="elf-icon" />
              ) : (
                <div className="custom">{token?.symbol[0]}</div>
              )}
            </div>
            <div className="center">
              <p className="symbol">{token?.symbol}</p>
              <p className="amount">{`${t('Balance_with_colon')} ${formatAmountShow(
                divDecimals(balance, token.decimals),
              )} ${token?.symbol}`}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="item amount">
        <div className="label">
          <div>{t('Amount_with_colon')}</div>
          <Button onClick={handleMax}>Max</Button>
        </div>
        <div className="control">
          <div className="amount-input">
            <Input
              type="text"
              placeholder={`0`}
              className={clsx(!isTestNet && 'need-convert')}
              value={amount}
              maxLength={18}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setAmount((v) => v?.replace(` ${token?.symbol}`, ''));
              }}
              onBlur={handleAmountBlur}
              onChange={(e) => {
                setAmount(e.target.value);
                onChange({ amount: e.target.value, balance });
              }}
            />
            {!isTestNet && <span className="convert">{amountInUsd}</span>}
          </div>
        </div>
      </div>
      {errorMsg && <span className={clsx([!isManagerSynced && 'error-warning', 'error-msg'])}>{errorMsg}</span>}
    </div>
  );
}
