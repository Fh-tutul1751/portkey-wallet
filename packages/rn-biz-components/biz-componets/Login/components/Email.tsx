import React, { useState, useRef } from 'react';
import { TextInput, View } from 'react-native';
import { handleErrorMessage } from '@portkey-wallet/utils';
import { checkEmail } from '@portkey-wallet/utils/check';
import { BGStyles } from '@portkey-wallet/rn-components/theme/styles';
import Loading from '@portkey-wallet/rn-components/components/Loading';
import { useEffectOnce } from '@portkey-wallet/hooks/index';
import { useLanguage } from '@portkey-wallet/rn-base/i18n/hooks';
import myEvents from '@portkey-wallet/rn-base/utils/deviceEvent';
import styles from '../styles';
import CommonInput from '@portkey-wallet/rn-components/components/CommonInput';
import CommonButton from '@portkey-wallet/rn-components/components/CommonButton';
// import GStyles from 'assets/theme/GStyles';
import { PageLoginType, PageType } from '../types';
import { useOnLogin } from '@portkey-wallet/rn-base/hooks/login';
import TermsServiceButton from './TermsServiceButton';
import TabButton from './TabButton';
import useLockCallback from '@portkey-wallet/hooks/useLockCallback';
import { useInputFocus } from '@portkey-wallet/rn-base/hooks/useInputFocus';
import GStyles from '@portkey-wallet/rn-components/theme/GStyles';

const TitleMap = {
  [PageType.login]: {
    button: 'Log In',
  },
  [PageType.signup]: {
    button: 'Sign up',
  },
};

export default function Email({
  setLoginType,
  type = PageType.login,
}: {
  setLoginType: (type: PageLoginType) => void;
  type?: PageType;
}) {
  const { t } = useLanguage();
  const iptRef = useRef<TextInput>();
  useInputFocus(iptRef);
  const [loading] = useState<boolean>();
  const [loginAccount, setLoginAccount] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const onLogin = useOnLogin(type === PageType.login);

  const onPageLogin = useLockCallback(async () => {
    const message = checkEmail(loginAccount) || undefined;
    setErrorMessage(message);
    if (message) return;
    const loadingKey = Loading.show();
    try {
      await onLogin({ loginAccount: loginAccount as string });
    } catch (error) {
      setErrorMessage(handleErrorMessage(error));
    }
    Loading.hide(loadingKey);
  }, [loginAccount, onLogin]);

  useEffectOnce(() => {
    const listener = myEvents[type === PageType.login ? 'clearLoginInput' : 'clearSignupInput'].addListener(() => {
      setLoginAccount('');
      setErrorMessage(undefined);
    });
    return () => listener.remove();
  });

  return (
    <View style={[BGStyles.bg1, styles.card, GStyles.itemCenter]}>
      <View style={GStyles.width100}>
        <View style={[GStyles.flexRowWrap, GStyles.marginBottom(20)]}>
          {/* <TabButton title="Phone" style={GStyles.marginRight(8)} onPress={() => setLoginType(PageLoginType.phone)} /> */}
          <TabButton isActive title="Email" onPress={() => setLoginType(PageLoginType.email)} />
        </View>
        <CommonInput
          ref={iptRef}
          value={loginAccount}
          type="general"
          autoCorrect={false}
          onChangeText={setLoginAccount}
          errorMessage={errorMessage}
          keyboardType="email-address"
          placeholder={t('Enter Email')}
          containerStyle={styles.inputContainerStyle}
        />
        <CommonButton
          containerStyle={GStyles.marginTop(16)}
          disabled={!loginAccount}
          type="primary"
          loading={loading}
          onPress={onPageLogin}>
          {t(TitleMap[type].button)}
        </CommonButton>
      </View>
      <TermsServiceButton />
    </View>
  );
}
