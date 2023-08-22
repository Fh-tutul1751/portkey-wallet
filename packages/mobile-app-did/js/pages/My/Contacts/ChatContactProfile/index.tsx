import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import PageContainer from 'components/PageContainer';
import { useLanguage } from 'i18n/hooks';
import navigationService from 'utils/navigationService';
import { ContactItemType } from '@portkey-wallet/types/types-ca/contact';
import CommonButton from 'components/CommonButton';
import GStyles from 'assets/theme/GStyles';
import useRouterParams from '@portkey-wallet/hooks/useRouterParams';
import { defaultColors } from 'assets/theme';
import ProfileHeaderSection from 'pages/My/components/ProfileHeaderSection';
import ProfileHandleSection from 'pages/My/components/ProfileHandleSection';
import ProfilePortkeyIDSection from 'pages/My/components/ProfilePortkeyIDSection';
import ProfileAddressSection from 'pages/My/components/ProfileAddressSection';

type RouterParams = {
  contact?: ContactItemType;
};

const ContactProfile: React.FC = () => {
  const { contact } = useRouterParams<RouterParams>();
  const { t } = useLanguage();

  return (
    <PageContainer
      titleDom="Details"
      safeAreaColor={['blue', 'gray']}
      containerStyles={pageStyles.pageWrap}
      scrollViewProps={{ disabled: true }}>
      <ScrollView alwaysBounceVertical={true}>
        <ProfileHeaderSection name={contact?.name || ''} />
        <ProfileHandleSection
          isAdded
          onPressAdded={() => console.log('add!!')}
          onPressChat={() => navigationService.navigate('ChatDetails')}
        />
        <ProfilePortkeyIDSection portkeyID={contact?.userId || contact?.portkeyId || contact?.portKeyId} />
        <ProfileAddressSection addressList={contact?.addresses || contact?.addressWithChain} />
      </ScrollView>
      <CommonButton
        type="primary"
        containerStyle={GStyles.paddingTop(16)}
        onPress={() => navigationService.navigate('ChatContactProfileEdit', { contact })}>
        {t('Edit')}
      </CommonButton>
    </PageContainer>
  );
};

export default ContactProfile;

export const pageStyles = StyleSheet.create({
  pageWrap: {
    flex: 1,
    backgroundColor: defaultColors.bg4,
    ...GStyles.paddingArg(24, 20, 18),
  },
});
