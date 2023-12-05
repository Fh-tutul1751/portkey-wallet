import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import PageContainer from 'components/PageContainer';
import { defaultColors } from 'assets/theme';
import GStyles from 'assets/theme/GStyles';
import { pTd } from 'utils/unit';
import SendRedPacketGroupSection, { ValuesType } from '../components/SendRedPacketGroupSection';
import { TextM } from 'components/CommonText';
import { RedPackageTypeEnum } from '@portkey-wallet/im';
import PaymentOverlay from 'components/PaymentOverlay';
import { timesDecimals } from '@portkey-wallet/utils/converter';
import { useCheckAllowanceAndApprove } from 'hooks/wallet';
import { useCalculateRedPacketFee } from 'hooks/useCalculateRedPacketFee';
import { useGetRedPackageConfig, useSendRedPackage } from '@portkey-wallet/hooks/hooks-ca/im';
import { useGetCAContract } from 'hooks/contract';
import { useCurrentChannelId } from '../context/hooks';
import { useSecuritySafeCheckAndToast } from 'hooks/security';
import Loading from 'components/Loading';
import CommonToast from 'components/CommonToast';
import { useCheckManagerSyncState } from 'hooks/wallet';
import { ContractBasic } from '@portkey-wallet/contracts/utils/ContractBasic';
import navigationService from 'utils/navigationService';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { isIOS } from '@portkey-wallet/utils/mobile/device';
import { checkIsUserCancel } from '@portkey-wallet/utils';

export default function SendPacketP2PPage() {
  const currentChannelId = useCurrentChannelId();
  const calculateRedPacketFee = useCalculateRedPacketFee();
  const sendRedPackage = useSendRedPackage();
  const getCAContract = useGetCAContract();
  const securitySafeCheckAndToast = useSecuritySafeCheckAndToast();
  const checkAllowanceAndApprove = useCheckAllowanceAndApprove();
  const checkManagerSyncState = useCheckManagerSyncState();
  const { getContractAddress } = useGetRedPackageConfig(true);
  const [, resetOverlayCount] = useState(0);

  const onPressBtn = useCallback(
    async (values: ValuesType) => {
      Loading.show();
      try {
        const isManagerSynced = await checkManagerSyncState(values.chainId);
        if (!isManagerSynced) {
          CommonToast.warn('Synchronizing on-chain account information...');
          return;
        }
        const isSafe = await securitySafeCheckAndToast(values.chainId);
        if (!isSafe) return;
      } catch (error) {
        CommonToast.failError(error);
        return;
      } finally {
        Loading.hide();
      }

      const totalAmount = timesDecimals(values.count, values.decimals);
      let caContract: ContractBasic;
      try {
        await PaymentOverlay.showRedPacket({
          tokenInfo: {
            symbol: values.symbol,
            decimals: values.decimals,
          },
          amount: values.count,
          chainId: values.chainId,
          calculateTransactionFee: () => calculateRedPacketFee(values),
        });

        const redPacketContractAddress = getContractAddress(values.chainId);
        if (!redPacketContractAddress) {
          throw new Error('redPacketContractAddress is not exist');
        }

        caContract = await getCAContract(values.chainId);

        await checkAllowanceAndApprove({
          caContract,
          spender: redPacketContractAddress,
          bigAmount: totalAmount,
          ...values,
          decimals: Number(values.decimals),
          isShowOnceLoading: true,
        });
      } catch (error) {
        console.log(error, 'send check ====error');
        if (!checkIsUserCancel(error)) {
          CommonToast.failError('Sent failed!');
        }
        return;
      }

      Loading.showOnce();
      try {
        await sendRedPackage({
          chainId: values.chainId,
          symbol: values.symbol,
          totalAmount: totalAmount.toFixed(0),
          decimal: values.decimals,
          memo: values.memo,
          caContract: caContract,
          type: RedPackageTypeEnum.P2P,
          count: 1,
          channelId: currentChannelId || '',
        });
        CommonToast.success('Sent successfully!');
        navigationService.goBack();
      } catch (error) {
        console.log(error, 'sendRedPackage ====error');
        CommonToast.failError('Sent failed!');
      } finally {
        Loading.hide();
      }
    },
    [
      calculateRedPacketFee,
      checkAllowanceAndApprove,
      checkManagerSyncState,
      currentChannelId,
      getCAContract,
      getContractAddress,
      securitySafeCheckAndToast,
      sendRedPackage,
    ],
  );

  return (
    <PageContainer
      titleDom="Send Crypto Box"
      hideTouchable
      safeAreaColor={['blue', 'gray']}
      scrollViewProps={{ disabled: true }}
      containerStyles={styles.container}>
      <KeyboardAwareScrollView enableOnAndroid={true} contentContainerStyle={styles.scrollStyle}>
        <SendRedPacketGroupSection type={RedPackageTypeEnum.P2P} onPressButton={onPressBtn} />
        <View style={GStyles.flex1} onLayout={() => resetOverlayCount(p => p + 1)} />
        <TextM style={styles.tips}>
          {
            'A crypto box is valid for 24 hours. Unclaimed tokens will be automatically returned to you upon expiration.'
          }
        </TextM>
      </KeyboardAwareScrollView>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flex: 1,
    backgroundColor: defaultColors.bg4,
    ...GStyles.paddingArg(0, 0),
  },
  scrollStyle: {
    minHeight: '100%',
    ...GStyles.paddingArg(16, 20),
  },
  groupNameWrap: {
    height: pTd(72),
    paddingHorizontal: pTd(16),
    marginHorizontal: pTd(20),
    marginVertical: pTd(24),
    borderRadius: pTd(6),
    backgroundColor: defaultColors.bg1,
  },
  selectHeaderWrap: {
    marginTop: pTd(16),
    marginHorizontal: pTd(20),
  },
  inputWrap: {
    paddingTop: pTd(12),
    paddingBottom: pTd(8),
    paddingHorizontal: pTd(20),
  },
  buttonWrap: {
    ...GStyles.paddingArg(10, 20, 16),
    backgroundColor: defaultColors.bg1,
  },
  nameInputStyle: {
    fontSize: pTd(16),
  },
  nameInputContainerStyle: {
    flex: 1,
  },
  nameInputErrorStyle: {
    height: 0,
    padding: 0,
    margin: 0,
  },
  tips: {
    marginTop: pTd(40),
    textAlign: 'center',
    color: defaultColors.font3,
    marginBottom: isIOS ? 0 : pTd(16),
  },
});
