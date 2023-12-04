import { defaultColors } from 'assets/theme';
import React, { useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { pTd } from 'utils/unit';
import PageContainer from 'components/PageContainer';
import { useLanguage } from 'i18n/hooks';
import GStyles from 'assets/theme/GStyles';
import { TextM } from 'components/CommonText';
import fonts from 'assets/theme/fonts';
import { FontStyles } from 'assets/theme/styles';
import BuyForm from './components/BuyForm';
import SellForm from './components/SellForm';
import { PaymentTypeEnum } from '@portkey-wallet/types/types-ca/payment';
import ActionSheet from 'components/ActionSheet';
import { useCurrentWalletInfo } from '@portkey-wallet/hooks/hooks-ca/wallet';
import Loading from 'components/Loading';
import useLockCallback from '@portkey-wallet/hooks/useLockCallback';
import useEffectOnce from 'hooks/useEffectOnce';
import CommonToast from 'components/CommonToast';
import { useSecuritySafeCheckAndToast } from 'hooks/security';
import { MAIN_CHAIN_ID } from '@portkey-wallet/constants/constants-ca/activity';
import { useAppBuyButtonShow } from 'hooks/cms';
import useRouterParams from '@portkey-wallet/hooks/useRouterParams';

type TabItemType = {
  name: string;
  type: PaymentTypeEnum;
  component: JSX.Element;
};

const tabList: TabItemType[] = [
  {
    name: 'Buy',
    type: PaymentTypeEnum.BUY,
    component: <BuyForm />,
  },
  {
    name: 'Sell',
    type: PaymentTypeEnum.SELL,
    component: <SellForm />,
  },
];

export default function BuyHome() {
  const { t } = useLanguage();
  const { isBuySectionShow, isSellSectionShow, refreshBuyButton } = useAppBuyButtonShow();
  const { caHash } = useCurrentWalletInfo();
  const securitySafeCheckAndToast = useSecuritySafeCheckAndToast();

  const { toTab } = useRouterParams<{ toTab: PaymentTypeEnum }>();

  const [selectTab, setSelectTab] = useState<PaymentTypeEnum>(
    toTab === PaymentTypeEnum.BUY && isBuySectionShow ? PaymentTypeEnum.BUY : PaymentTypeEnum.SELL,
  );

  useEffectOnce(() => {
    (async () => {
      if (!isBuySectionShow) {
        try {
          if (!(await securitySafeCheckAndToast(MAIN_CHAIN_ID))) return;
        } catch (error) {
          console.log('error', error);
          return;
        }
      }
    })();
  });

  const onTabPress = useLockCallback(
    async (type: PaymentTypeEnum) => {
      if (type === PaymentTypeEnum.BUY && !isBuySectionShow) {
        ActionSheet.alert({
          title2: (
            <TextM style={[GStyles.textAlignCenter]}>
              On-ramp is currently not supported. It will be launched in the coming weeks.
            </TextM>
          ),
          buttons: [{ title: 'OK' }],
        });
        refreshBuyButton();
        return;
      }
      if (type === PaymentTypeEnum.SELL && !isSellSectionShow) {
        ActionSheet.alert({
          title2: (
            <TextM style={[GStyles.textAlignCenter]}>
              Off-ramp is currently not supported. It will be launched in the coming weeks.
            </TextM>
          ),
          buttons: [{ title: 'OK' }],
        });
        refreshBuyButton();
        return;
      }

      if (type === PaymentTypeEnum.SELL) {
        Loading.show();
        try {
          if (!(await securitySafeCheckAndToast(MAIN_CHAIN_ID))) return;
        } catch (error) {
          CommonToast.failError(error);
          return;
        } finally {
          Loading.hide();
        }
      }
      setSelectTab(type);
    },
    [caHash, isBuySectionShow, isSellSectionShow, refreshBuyButton],
  );

  return (
    <PageContainer
      safeAreaColor={['blue', 'white']}
      titleDom={t('Buy')}
      containerStyles={styles.pageWrap}
      scrollViewProps={{ disabled: true }}>
      <View style={[GStyles.flexRow, GStyles.alignCenter]}>
        <View style={styles.tabHeader}>
          {tabList.map(tabItem => (
            <TouchableOpacity
              key={tabItem.name}
              onPress={() => {
                onTabPress(tabItem.type);
              }}>
              <View style={[styles.tabWrap, selectTab === tabItem.type && styles.selectTabStyle]}>
                <TextM style={[FontStyles.font7, selectTab === tabItem.type && styles.selectTabTextStyle]}>
                  {tabItem.name}
                </TextM>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={GStyles.flex1}>{tabList.find(item => item.type === selectTab)?.component}</View>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  pageWrap: {
    flex: 1,
    backgroundColor: defaultColors.bg1,
    ...GStyles.paddingArg(16, 20),
  },
  tabHeader: {
    width: pTd(190),
    backgroundColor: defaultColors.bg6,
    borderRadius: pTd(6),
    flexDirection: 'row',
    justifyContent: 'space-between',
    ...GStyles.paddingArg(3),
    marginBottom: pTd(32),
  },
  tabWrap: {
    width: pTd(88),
    height: pTd(30),
    borderRadius: pTd(6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectTabStyle: {
    shadowColor: defaultColors.shadow1,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.09,
    shadowRadius: 4,
    elevation: 2,
    backgroundColor: defaultColors.bg1,
  },
  selectTabTextStyle: {
    color: defaultColors.font5,
    ...fonts.mediumFont,
  },
});
