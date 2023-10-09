import React, { memo } from 'react';
import Svg from 'components/Svg';
import { View, TouchableOpacity, StyleProp, ViewProps } from 'react-native';
import { TextM } from 'components/CommonText';
import { useLanguage } from 'i18n/hooks';
import { pTd } from 'utils/unit';
import GStyles from 'assets/theme/GStyles';
import { commonButtonStyle } from '../SendButton/style';
import Loading from 'components/Loading';
import CommonToast from 'components/CommonToast';
import DisclaimerModal from 'components/DisclaimerModal';
import { useDisclaimer } from '@portkey-wallet/hooks/hooks-ca/disclaimer';
import { useCurrentNetworkInfo } from '@portkey-wallet/hooks/hooks-ca/network';
import navigationService from 'utils/navigationService';
import { useSecuritySafeCheckAndToast } from 'hooks/security';

type BridgeButtonPropsType = {
  wrapStyle?: StyleProp<ViewProps>;
};

const BridgeButton = (props: BridgeButtonPropsType) => {
  const { t } = useLanguage();
  const { wrapStyle = {} } = props;
  const { eBridgeUrl } = useCurrentNetworkInfo();
  const { checkDappIsConfirmed } = useDisclaimer();
  const securitySafeCheckAndToast = useSecuritySafeCheckAndToast();

  return (
    <View style={[commonButtonStyle.buttonWrap, wrapStyle]}>
      <TouchableOpacity
        style={[commonButtonStyle.iconWrapStyle, GStyles.alignCenter]}
        onPress={async () => {
          try {
            Loading.show();
            if (!(await securitySafeCheckAndToast())) return;
            if (!checkDappIsConfirmed(eBridgeUrl || '')) return DisclaimerModal.showConnectModal();
            navigationService.navigate('EBridge');
          } catch (error) {
            CommonToast.failError(error);
          } finally {
            Loading.hide();
          }
        }}>
        <Svg icon="eBridge" size={pTd(46)} />
      </TouchableOpacity>
      <TextM style={[commonButtonStyle.commonTitleStyle, commonButtonStyle.dashBoardTitleColorStyle]}>
        {t('Bridge')}
      </TextM>
    </View>
  );
};

export default memo(BridgeButton);
