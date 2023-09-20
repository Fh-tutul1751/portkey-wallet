import { useCurrentWalletInfo } from '@portkey-wallet/hooks/hooks-ca/wallet';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Linking } from 'react-native';
import { usePin } from './store';
import useEffectOnce from './useEffectOnce';
import { checkAuthLoginData, handleScheme } from 'utils/scheme';
import { useDiscoverJumpWithNetWork } from './discover';
import { SchemeParsedUrl } from 'types/common';
import { SCHEME_ACTION } from 'constants/scheme';
import { showAuthLogin } from 'components/AuthLoginOverlay';
import { checkIsUrl, prefixUrlWithProtocol } from '@portkey-wallet/utils/dapp/browser';
import { useHandlePortkeyUrl } from './useQrScan';
import { useIsChatShow } from '@portkey-wallet/hooks/hooks-ca/cms';

export function useHandleParsedUrl() {
  const jumpToWebview = useDiscoverJumpWithNetWork();
  const handlePortkeyUrl = useHandlePortkeyUrl();
  const isChatShow = useIsChatShow();

  return useCallback(
    (parsedUrl: SchemeParsedUrl) => {
      const { domain, action, query } = parsedUrl;
      try {
        switch (action) {
          case SCHEME_ACTION.login: {
            let { extraData, data } = query as any;
            extraData = JSON.parse(extraData);
            data = JSON.parse(data);
            if (checkAuthLoginData(extraData, data)) showAuthLogin({ loginData: data, extraData: extraData, domain });
            break;
          }
          case SCHEME_ACTION.linkDapp: {
            const { url } = query;
            if (typeof url !== 'string' || !checkIsUrl(url)) return;
            const fixUrl = prefixUrlWithProtocol(url);
            jumpToWebview({ item: { name: fixUrl, url: fixUrl }, autoApprove: true });
            break;
          }
          case SCHEME_ACTION.addContact: {
            if (!isChatShow) return;
            const id = Object.values(query).join('');
            handlePortkeyUrl({
              portkeyId: id,
              showLoading: false,
              goBack: false,
            });
            break;
          }
          case SCHEME_ACTION.addGroup: {
            if (!isChatShow) return;
            const id = Object.values(query).join('');
            // TODO:addGroup actions
            break;
          }
          default:
            console.log('this action is not supported');
        }
      } catch (error) {
        console.log(error);
      }
    },
    [handlePortkeyUrl, isChatShow, jumpToWebview],
  );
}

export default function useScheme() {
  const { address, caHash } = useCurrentWalletInfo();
  const [schemeUrl, setSchemeUrl] = useState<string>();
  const handleParsedUrl = useHandleParsedUrl();
  const pin = usePin();
  const logged = useMemo(() => !!address && caHash, [address, caHash]);

  const getInitialURL = useCallback(async () => {
    if (!logged) return;
    const url = await Linking.getInitialURL();
    url && setSchemeUrl(url);
  }, [logged]);

  useEffectOnce(() => {
    getInitialURL();
  });

  useEffect(() => {
    const linkingListener = Linking.addEventListener('url', ({ url }) => {
      if (!logged) return;
      url && setSchemeUrl(url);
    });
    return () => {
      linkingListener.remove();
    };
  }, [logged]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (pin && schemeUrl) {
      timer = setTimeout(() => {
        const parsedUrl = handleScheme(schemeUrl);
        if (parsedUrl) handleParsedUrl(parsedUrl);
        setSchemeUrl(undefined);
      }, 500);
    }
    return () => {
      timer && clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin, schemeUrl]);
}
