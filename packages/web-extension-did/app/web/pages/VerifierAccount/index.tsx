import { useNavigate } from 'react-router';
import { useAppDispatch, useLoginInfo, useGuardiansInfo, useUserInfo, useLoading } from 'store/Provider/hooks';
import { useCallback, useMemo } from 'react';
import { message } from 'antd';
import { setUserGuardianItemStatus } from '@portkey-wallet/store/store-ca/guardians/actions';
import { OperationTypeEnum, VerifierInfo, VerifyStatus } from '@portkey-wallet/types/verifier';
import useLocationState from 'hooks/useLocationState';
import { useCurrentWallet, useCurrentWalletInfo, useOriginChainId } from '@portkey-wallet/hooks/hooks-ca/wallet';
import { handleGuardian } from 'utils/sandboxUtil/handleGuardian';
import { GuardianMth } from 'types/guardians';
import { useCurrentNetworkInfo } from '@portkey-wallet/hooks/hooks-ca/network';
import { useCurrentChain } from '@portkey-wallet/hooks/hooks-ca/chainList';
import { setRegisterVerifierAction } from 'store/reducers/loginCache/actions';
import { contractErrorHandler } from 'utils/tryErrorHandler';
import aes from '@portkey-wallet/utils/aes';
import { handleVerificationDoc } from '@portkey-wallet/utils/guardian';
import useGuardianList from 'hooks/useGuardianList';
import VerifierAccountPrompt from './Prompt';
import VerifierAccountPopup from './Popup';
import './index.less';
import { useOnManagerAddressAndQueryResult } from 'hooks/useOnManagerAddressAndQueryResult';
import { useCommonState } from 'store/Provider/hooks';
import InternalMessage from 'messages/InternalMessage';
import { PortkeyMessageTypes } from 'messages/InternalMessageTypes';
import VerifierPage from 'pages/components/VerifierPage';

export default function VerifierAccount() {
  const { loginAccount } = useLoginInfo();
  const { userGuardianStatus, currentGuardian, opGuardian, userGuardiansList } = useGuardiansInfo();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { state } = useLocationState<
    | 'register'
    | 'login'
    | 'guardians/add'
    | 'guardians/edit'
    | 'guardians/del'
    | 'guardians/setLoginAccount'
    | 'removeManage'
  >();
  const { isNotLessThan768 } = useCommonState();
  const { walletInfo } = useCurrentWallet();
  const currentNetwork = useCurrentNetworkInfo();
  const originChainId = useOriginChainId();
  const currentChain = useCurrentChain(originChainId);
  const { setLoading } = useLoading();
  const { passwordSeed } = useUserInfo();
  const getGuardianList = useGuardianList();
  const { address: managerAddress } = useCurrentWalletInfo();
  const isBigScreenPrompt = useMemo(
    () => (isNotLessThan768 ? state?.includes('guardian') || state?.includes('removeManage') : false),
    [isNotLessThan768, state],
  );
  const onManagerAddressAndQueryResult = useOnManagerAddressAndQueryResult('register');

  const onSuccessInGuardian = useCallback(
    async (res: VerifierInfo) => {
      if (state === 'guardians/setLoginAccount') {
        try {
          setLoading(true);
          const privateKey = aes.decrypt(walletInfo.AESEncryptPrivateKey, passwordSeed);
          if (!currentChain?.endPoint || !privateKey) return message.error('set login account error');
          const result = await handleGuardian({
            rpcUrl: currentChain.endPoint,
            chainType: currentNetwork.walletType,
            address: currentChain.caContractAddress,
            privateKey,
            paramsOption: {
              method: GuardianMth.SetGuardianTypeForLogin,
              params: {
                caHash: walletInfo?.caHash,
                guardian: {
                  type: currentGuardian?.guardianType,
                  verifierId: currentGuardian?.verifier?.id,
                  identifierHash: currentGuardian?.identifierHash,
                },
              },
            },
          });
          console.log('setLoginAccount', result);
          getGuardianList({ caHash: walletInfo.caHash });
          setLoading(false);
          navigate('/setting/guardians/view');
        } catch (error: any) {
          setLoading(false);
          message.error(contractErrorHandler(error));
          console.log('---set login account error', error);
        }
      } else {
        if (!currentGuardian) return;
        const { guardianIdentifier } = handleVerificationDoc(res.verificationDoc);
        dispatch(
          setUserGuardianItemStatus({
            key: currentGuardian.key,
            status: VerifyStatus.Verified,
            signature: res.signature,
            verificationDoc: res.verificationDoc,
            identifierHash: guardianIdentifier,
          }),
        );
        navigate('/setting/guardians/guardian-approval', { state: state });
      }
    },
    [
      currentChain,
      currentGuardian,
      currentNetwork.walletType,
      dispatch,
      getGuardianList,
      navigate,
      passwordSeed,
      setLoading,
      state,
      walletInfo,
    ],
  );

  const onSuccessInRemoveOtherManage = useCallback(
    (res: VerifierInfo) => {
      if (!currentGuardian) return;
      const { guardianIdentifier } = handleVerificationDoc(res.verificationDoc);
      dispatch(
        setUserGuardianItemStatus({
          key: currentGuardian.key,
          status: VerifyStatus.Verified,
          signature: res.signature,
          verificationDoc: res.verificationDoc,
          identifierHash: guardianIdentifier,
        }),
      );
      navigate('/setting/wallet-security/manage-devices/guardian-approval', { state: state });
    },
    [currentGuardian, dispatch, navigate, state],
  );

  const onSuccess = useCallback(
    async (res: VerifierInfo) => {
      if (state === 'register') {
        dispatch(setRegisterVerifierAction(res));
        const result = await InternalMessage.payload(PortkeyMessageTypes.CHECK_WALLET_STATUS).send();
        if (walletInfo.address && result.data.privateKey) {
          onManagerAddressAndQueryResult(result.data.privateKey, res);
        } else {
          navigate('/login/set-pin/register');
        }
      } else if (state == 'login') {
        if (!currentGuardian) return;
        dispatch(
          setUserGuardianItemStatus({
            key: currentGuardian.key,
            status: VerifyStatus.Verified,
            signature: res.signature,
            verificationDoc: res.verificationDoc,
          }),
        );
        if (userGuardiansList?.length === 1) {
          const res = await InternalMessage.payload(PortkeyMessageTypes.CHECK_WALLET_STATUS).send();
          if (managerAddress && res.data.privateKey) {
            onManagerAddressAndQueryResult(res.data.privateKey);
          } else {
            navigate('/login/set-pin/login');
          }
        } else {
          navigate('/login/guardian-approval');
        }
      } else if (state?.indexOf('guardians') !== -1) {
        onSuccessInGuardian(res);
        message.success('Verified Successful');
      } else if (state?.indexOf('removeManage') !== -1) {
        onSuccessInRemoveOtherManage(res);
      } else {
        message.error('Router state error');
      }
    },
    [
      state,
      dispatch,
      walletInfo.address,
      onManagerAddressAndQueryResult,
      navigate,
      currentGuardian,
      userGuardiansList?.length,
      managerAddress,
      onSuccessInGuardian,
      onSuccessInRemoveOtherManage,
    ],
  );

  const handleBack = useCallback(() => {
    if (state === 'register') {
      navigate('/register/start/create');
    } else if (state === 'login') {
      navigate('/login/guardian-approval');
    } else if (state === 'guardians/add' && !userGuardianStatus?.[opGuardian?.key || '']?.signature) {
      navigate('/setting/guardians/add', { state: 'back' });
    } else if (state === 'guardians/setLoginAccount') {
      navigate('/setting/guardians/view');
    } else if (state.indexOf('guardians') !== -1) {
      navigate('/setting/guardians/guardian-approval', { state: state });
    } else {
      navigate(-1);
    }
  }, [navigate, opGuardian?.key, state, userGuardianStatus]);

  const isInitStatus = useMemo(() => {
    if (state === 'register') return true;
    return !!currentGuardian?.isInitStatus;
  }, [currentGuardian, state]);

  const operationType: OperationTypeEnum = useMemo(() => {
    switch (state) {
      case 'register':
        return OperationTypeEnum.register;
      case 'login':
        return OperationTypeEnum.communityRecovery;
      case 'guardians/add':
        return OperationTypeEnum.addGuardian;
      case 'guardians/edit':
        return OperationTypeEnum.editGuardian;
      case 'guardians/del':
        return OperationTypeEnum.deleteGuardian;
      case 'guardians/setLoginAccount':
        return OperationTypeEnum.setLoginAccount;
      default:
        if (state && state?.indexOf('removeManage') !== -1) {
          return OperationTypeEnum.removeOtherManager;
        } else {
          return OperationTypeEnum.unknown;
        }
    }
  }, [state]);

  const renderContent = useMemo(
    () => (
      <div className="common-content1 verifier-account-content">
        <VerifierPage
          loginAccount={loginAccount}
          isInitStatus={isInitStatus}
          currentGuardian={currentGuardian}
          guardianType={loginAccount?.loginType}
          onSuccess={onSuccess}
          operationType={operationType}
        />
      </div>
    ),
    [currentGuardian, isInitStatus, loginAccount, onSuccess, operationType],
  );

  const props = useMemo(
    () => ({
      onBack: handleBack,
      renderContent,
    }),
    [handleBack, renderContent],
  );

  return isNotLessThan768 ? (
    <VerifierAccountPrompt {...props} isBigScreenPrompt={isBigScreenPrompt} />
  ) : (
    <VerifierAccountPopup {...props} />
  );
}
