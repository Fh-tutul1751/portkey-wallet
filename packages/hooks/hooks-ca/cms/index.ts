import { useCallback, useEffect, useMemo } from 'react';
import { useAppCASelector } from '../.';
import { useAppCommonDispatch, useEffectOnce } from '../../index';
import {
  useCurrentNetworkInfo,
  useIsIMServiceExist,
  useIsMainnet,
  useNetworkList,
} from '@portkey-wallet/hooks/hooks-ca/network';
import {
  getDiscoverGroupAsync,
  getSocialMediaAsync,
  getRememberMeBlackListAsync,
  getTabMenuAsync,
  setEntrance,
} from '@portkey-wallet/store/store-ca/cms/actions';

import { getOrigin } from '@portkey-wallet/utils/dapp/browser';
import { checkSiteIsInBlackList } from '@portkey-wallet/utils/session';
import { ChatTabName } from '@portkey-wallet/constants/constants-ca/chat';
import { DEFAULT_ENTRANCE_SHOW, generateEntranceShow, getEntrance } from './util';
import { IEntranceItem, IEntranceMatchValueConfig } from '@portkey-wallet/types/types-ca/cms';
import { NetworkType } from '@portkey-wallet/types';

export const useCMS = () => useAppCASelector(state => state.cms);

export function useTabMenuList(isInit = false) {
  const dispatch = useAppCommonDispatch();
  const { tabMenuListNetMap } = useCMS();
  const { networkType } = useCurrentNetworkInfo();
  const networkList = useNetworkList();

  const tabMenuList = useMemo(() => tabMenuListNetMap[networkType] || [], [networkType, tabMenuListNetMap]);

  useEffect(() => {
    if (isInit) {
      networkList.forEach(item => {
        dispatch(getTabMenuAsync(item.networkType));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isInit) {
      dispatch(getTabMenuAsync(networkType));
    }
  }, [dispatch, isInit, networkType]);

  return tabMenuList;
}

export function useSocialMediaList(isInit = false) {
  const dispatch = useAppCommonDispatch();
  const { socialMediaListNetMap } = useCMS();
  const { networkType } = useCurrentNetworkInfo();
  const networkList = useNetworkList();

  const socialMediaList = useMemo(() => socialMediaListNetMap[networkType] || [], [networkType, socialMediaListNetMap]);

  useEffect(() => {
    if (isInit) {
      networkList.forEach(item => {
        dispatch(getSocialMediaAsync(item.networkType));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isInit) {
      dispatch(getSocialMediaAsync(networkType));
    }
  }, [dispatch, isInit, networkType]);

  return socialMediaList;
}

export function useDiscoverGroupList(isInit = false) {
  const dispatch = useAppCommonDispatch();
  const { discoverGroupListNetMap } = useCMS();
  const { networkType } = useCurrentNetworkInfo();
  const networkList = useNetworkList();

  const discoverGroupList = useMemo(
    () => discoverGroupListNetMap[networkType] || [],
    [networkType, discoverGroupListNetMap],
  );

  useEffect(() => {
    if (isInit) {
      networkList.forEach(item => {
        dispatch(getDiscoverGroupAsync(item.networkType));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isInit) {
      dispatch(getDiscoverGroupAsync(networkType));
    }
  }, [dispatch, isInit, networkType]);

  return discoverGroupList || [];
}

export const useEntrance = (config: IEntranceMatchValueConfig, isInit = false) => {
  const dispatch = useAppCommonDispatch();
  const { entranceNetMap } = useCMS();
  const { networkType } = useCurrentNetworkInfo();
  const networkList = useNetworkList();

  const entrance = useMemo(
    () => ({
      ...DEFAULT_ENTRANCE_SHOW,
      ...entranceNetMap?.[networkType],
    }),
    [networkType, entranceNetMap],
  );

  const refresh = useCallback(
    async (network?: NetworkType) => {
      const _entranceList = (await getEntrance(network || networkType)) as IEntranceItem[];
      const _entrance = await generateEntranceShow(config, _entranceList || []);
      dispatch(
        setEntrance({
          network: network || networkType,
          value: _entrance,
        }),
      );
      return _entrance;
    },
    [config, dispatch, networkType],
  );

  useEffectOnce(() => {
    if (isInit) {
      networkList.forEach(item => {
        refresh(item.networkType);
      });
    }
  });

  useEffectOnce(() => {
    if (!isInit) {
      refresh();
    }
  });

  return {
    entrance,
    refresh,
  };
};

export const useBuyButtonShow = (config: IEntranceMatchValueConfig) => {
  const { entrance, refresh } = useEntrance(config);
  const isMainnet = useIsMainnet();

  const isBuySectionShow = useMemo(() => isMainnet && entrance.buy, [entrance.buy, isMainnet]);

  const isSellSectionShow = useMemo(() => isMainnet && entrance.sell, [entrance.sell, isMainnet]);

  const isBuyButtonShow = useMemo(
    () => isMainnet && (isBuySectionShow || isSellSectionShow || false),
    [isBuySectionShow, isMainnet, isSellSectionShow],
  );

  const refreshBuyButton = useCallback(async () => {
    let isBuySectionShow = false;
    let isSellSectionShow = false;
    try {
      const result = await refresh();
      isBuySectionShow = result.buy;
      isSellSectionShow = result.sell;
    } catch (error) {
      console.log('refreshBuyButton error');
    }

    return {
      isBuySectionShow: isMainnet && isBuySectionShow,
      isSellSectionShow: isMainnet && isSellSectionShow,
    };
  }, [isMainnet, refresh]);

  return {
    isBuyButtonShow,
    isBuySectionShow,
    isSellSectionShow,
    refreshBuyButton,
  };
};

export const useETransShow = (config: IEntranceMatchValueConfig) => {
  const { entrance, refresh } = useEntrance(config);

  const isETransDepositShow = useMemo(() => entrance.eTransDeposit, [entrance.eTransDeposit]);

  const isETransWithdrawShow = useMemo(() => entrance.eTransWithdraw, [entrance.eTransWithdraw]);

  const isETransShow = useMemo(
    () => isETransDepositShow || isETransWithdrawShow || false,
    [isETransDepositShow, isETransWithdrawShow],
  );

  const refreshBuyButton = useCallback(async () => {
    let _isETransDepositShow = false;
    let _isETransWithdrawShow = false;
    try {
      const result = await refresh();
      _isETransDepositShow = result.eTransDeposit;
      _isETransWithdrawShow = result.eTransWithdraw;
    } catch (error) {
      console.log('refreshBuyButton error');
    }

    return {
      isETransDepositShow: _isETransDepositShow,
      isETransWithdrawShow: _isETransWithdrawShow,
    };
  }, [refresh]);

  return {
    isETransShow,
    isETransDepositShow,
    isETransWithdrawShow,
    refreshBuyButton,
  };
};

export const useRememberMeBlackList = (isInit = false) => {
  const dispatch = useAppCommonDispatch();
  const { rememberMeBlackListMap } = useCMS();
  const { networkType } = useCurrentNetworkInfo();
  const networkList = useNetworkList();

  const rememberMeBlackList = useMemo(
    () => rememberMeBlackListMap?.[networkType]?.map(ele => ele?.url) || [],
    [networkType, rememberMeBlackListMap],
  );

  useEffect(() => {
    if (isInit) {
      networkList.forEach(item => {
        dispatch(getRememberMeBlackListAsync(item.networkType));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isInit) {
      dispatch(getRememberMeBlackListAsync(networkType));
    }
  }, [dispatch, isInit, networkType]);

  return rememberMeBlackList || [];
};

export const useFetchCurrentRememberMeBlackList = () => {
  const dispatch = useAppCommonDispatch();
  const { networkType } = useCurrentNetworkInfo();

  return useCallback(() => {
    dispatch(getRememberMeBlackListAsync(networkType));
  }, [dispatch, networkType]);
};

export const useCheckSiteIsInBlackList = () => {
  const list = useRememberMeBlackList();
  return useCallback((url: string) => checkSiteIsInBlackList(list, getOrigin(url)), [list]);
};

export const useIsChatShow = () => {
  const { tabMenuListNetMap } = useCMS();
  const { networkType } = useCurrentNetworkInfo();
  const isIMServiceExist = useIsIMServiceExist();

  const IsChatShow = useMemo(() => {
    const tabMenuList = tabMenuListNetMap[networkType];
    if (!tabMenuList) return false;
    return isIMServiceExist && !!tabMenuList.find(item => item.type.value === ChatTabName);
  }, [isIMServiceExist, networkType, tabMenuListNetMap]);

  return IsChatShow;
};
