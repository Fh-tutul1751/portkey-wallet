import React, { useCallback, useMemo, useState } from 'react';
import PageContainer from 'components/PageContainer';
import { StyleSheet, View } from 'react-native';
import { defaultColors } from 'assets/theme';
import GStyles from 'assets/theme/GStyles';
import { useCurrentWalletInfo } from '@portkey-wallet/hooks/hooks-ca/wallet';

import useRouterParams from '@portkey-wallet/hooks/useRouterParams';
import { IPaymentSecurityItem } from '@portkey-wallet/types/types-ca/paymentSecurity';
import CommonButton from 'components/CommonButton';
import navigationService from 'utils/navigationService';
import { ApprovalType } from '@portkey-wallet/types/verifier';
import { TextM } from 'components/CommonText';
import { BGStyles, FontStyles } from 'assets/theme/styles';
import { pTd } from 'utils/unit';
import { RouteProp, useRoute } from '@react-navigation/native';
import useEffectOnce from 'hooks/useEffectOnce';
import CommonInput from 'components/CommonInput';
import CommonSwitch from 'components/CommonSwitch';
import { ErrorType } from 'types/common';
import { INIT_HAS_ERROR, INIT_NONE_ERROR } from 'constants/common';
import { isValidInteger } from '@portkey-wallet/utils/reg';
import { isIOS } from '@portkey-wallet/utils/mobile/device';
import { ZERO } from '@portkey-wallet/constants/misc';
import { divDecimals, timesDecimals } from '@portkey-wallet/utils/converter';

interface RouterParams {
  paymentSecurityDetail?: IPaymentSecurityItem;
}

type EditInfoType = {
  singleLimit: string;
  dailyLimit: string;
  restricted: boolean;
};

const PaymentSecurityEdit: React.FC = () => {
  const { paymentSecurityDetail: detail } = useRouterParams<RouterParams>();
  const [editInfo, setEditInfo] = useState<EditInfoType>();
  const [singleLimitError, setSingleLimitError] = useState<ErrorType>({ ...INIT_NONE_ERROR });
  const [dailyLimitError, setDailyLimitError] = useState<ErrorType>({ ...INIT_NONE_ERROR });

  useEffectOnce(() => {
    if (detail) {
      setEditInfo({
        singleLimit: detail.restricted ? divDecimals(detail.singleLimit, detail.decimals).toNumber().toString() : '',
        dailyLimit: detail.restricted ? divDecimals(detail.dailyLimit, detail.decimals).toNumber().toString() : '',
        restricted: detail.restricted,
      });
    }
  });

  const onRestrictedChange = useCallback((value: boolean) => {
    setEditInfo(pre => {
      if (!pre) return undefined;
      return {
        ...pre,
        restricted: value,
      };
    });
  }, []);
  const onSingleLimitInput = useCallback((value: string) => {
    setSingleLimitError({
      ...INIT_NONE_ERROR,
    });
    setEditInfo(pre => {
      if (!pre) return undefined;
      return {
        ...pre,
        singleLimit: value,
      };
    });
  }, []);
  const onDailyLimitInput = useCallback((value: string) => {
    setDailyLimitError({
      ...INIT_NONE_ERROR,
    });
    setEditInfo(pre => {
      if (!pre) return undefined;
      return {
        ...pre,
        dailyLimit: value,
      };
    });
  }, []);

  const save = useCallback(() => {
    if (!editInfo) return;
    let isError = false;

    if (!isValidInteger(editInfo.singleLimit)) {
      setSingleLimitError({
        ...INIT_HAS_ERROR,
        errorMsg: 'Please enter a valid number',
      });
      isError = true;
    }
    if (!isValidInteger(editInfo.dailyLimit)) {
      setDailyLimitError({
        ...INIT_HAS_ERROR,
        errorMsg: 'Please enter a valid number',
      });
      isError = true;
    }

    if (!isError && Number(editInfo.singleLimit) > Number(editInfo.dailyLimit)) {
      setSingleLimitError({
        ...INIT_HAS_ERROR,
        errorMsg: 'Cannot exceed the daily limit',
      });
      isError = true;
    }

    if (isError) return;

    navigationService.navigate('GuardianApproval', {
      approvalType: ApprovalType.modifyTransferLimit,
      paymentSecurityDetail: {
        chainId: detail?.chainId,
        symbol: detail?.symbol,
        singleLimit: editInfo.restricted ? timesDecimals(editInfo.singleLimit, detail?.decimals).toString() : '-1',
        dailyLimit: editInfo.restricted ? timesDecimals(editInfo.dailyLimit, detail?.decimals).toString() : '-1',
        restricted: editInfo.restricted,
        decimals: detail?.decimals,
      },
    });
  }, [detail, editInfo]);

  return (
    <PageContainer
      titleDom={'Transfer Settings'}
      safeAreaColor={['blue', 'gray']}
      containerStyles={pageStyles.pageWrap}
      scrollViewProps={{ disabled: true }}>
      <View>
        <View style={pageStyles.switchWrap}>
          <TextM>Transfer Settings</TextM>
          <CommonSwitch value={editInfo?.restricted || false} onValueChange={onRestrictedChange} />
        </View>

        {editInfo?.restricted ? (
          <>
            <CommonInput
              label={'Limit Per Transaction'}
              theme="white-bg"
              type="general"
              keyboardType={isIOS ? 'number-pad' : 'numeric'}
              value={editInfo?.singleLimit || ''}
              rightIcon={<TextM>{detail?.symbol || ''}</TextM>}
              onChangeText={onSingleLimitInput}
              maxLength={18}
              errorMessage={singleLimitError.isError ? singleLimitError.errorMsg : ''}
            />
            <CommonInput
              label={'Daily Limit'}
              theme="white-bg"
              type="general"
              keyboardType={isIOS ? 'number-pad' : 'numeric'}
              value={editInfo?.dailyLimit || ''}
              rightIcon={<TextM>{detail?.symbol || ''}</TextM>}
              onChangeText={onDailyLimitInput}
              maxLength={18}
              errorMessage={dailyLimitError.isError ? dailyLimitError.errorMsg : ''}
            />
            <TextM style={FontStyles.font3}>
              {
                'Transfers within the limits do not require guardian approval, but if exceed, you need to modify the settings.'
              }
            </TextM>
          </>
        ) : (
          <TextM style={FontStyles.font3}>No limit for transfer.</TextM>
        )}
      </View>
      <CommonButton type="solid" onPress={save}>
        Send Request
      </CommonButton>
    </PageContainer>
  );
};

const pageStyles = StyleSheet.create({
  pageWrap: {
    flex: 1,
    backgroundColor: defaultColors.bg4,
    justifyContent: 'space-between',
    ...GStyles.paddingArg(24, 20, 18),
  },
  switchWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: pTd(16),
    backgroundColor: defaultColors.bg1,
    marginBottom: pTd(24),
    height: pTd(56),
    alignItems: 'center',
    borderRadius: pTd(6),
  },
});

export default PaymentSecurityEdit;
