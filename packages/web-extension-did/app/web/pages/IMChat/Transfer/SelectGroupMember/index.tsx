import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useDebounceCallback, useEffectOnce } from '@portkey-wallet/hooks';
import SettingHeader from 'pages/components/SettingHeader';
import CustomSvg from 'components/CustomSvg';
import DropdownSearch from 'components/DropdownSearch';
import { Avatar } from '@portkey-wallet/im-ui-web';
import { useGroupChannelInfo, useRelationId } from '@portkey-wallet/hooks/hooks-ca/im';
import { ChannelMemberInfo } from '@portkey-wallet/im';
import CustomTokenDrawer from 'pages/components/CustomTokenDrawer';
import { AccountAssetItem } from '@portkey-wallet/types/types-ca/token';
import './index.less';

export interface IToMember {
  name: string;
  address: string;
}

export default function SelectGroupMember() {
  const { channelUuid } = useParams();
  const { relationId: myRelationId } = useRelationId();
  const { groupInfo, refresh } = useGroupChannelInfo(`${channelUuid}`);
  const { t } = useTranslation();
  const { state } = useLocation();
  const [filterWord, setFilterWord] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [assetsOpen, setAssetsOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const filterMemberList = useMemo(
    () => (groupInfo?.members || []).filter((item) => item.relationId !== myRelationId),
    [groupInfo?.members, myRelationId],
  );
  const [showMemberList, setShowMemberList] = useState<ChannelMemberInfo[]>(filterMemberList);
  // const toMemberRef = useRef<IToMember>();

  const handleSearch = useCallback(
    (keyword: string) => {
      keyword = keyword.trim();
      let _res = filterMemberList;
      if (keyword) {
        _res = filterMemberList.filter((item) => item.name.toLowerCase().includes(keyword.toLowerCase()));
      }
      setShowMemberList(_res);
    },
    [filterMemberList],
  );
  const searchDebounce = useDebounceCallback(
    (params) => {
      const _v = params.trim();
      _v ? handleSearch(_v) : setShowMemberList(filterMemberList);
      setFilterWord(_v);
    },
    [],
    500,
  );
  const handleClickMember = useCallback((item: ChannelMemberInfo) => {
    console.log('ChannelMemberInfo', item);
    // TODO sarah get address|name
    // item.AELFAddress;
    // getMemberDetail(item.AELFAddress)
    setAssetsOpen(true);
  }, []);
  const handleSelectAssets = useCallback(
    (v: AccountAssetItem, type: 'token' | 'nft') => {
      console.log('AccountAssetItem', v);
      // TODO sarah
      const isNFT = type === 'nft';
      const state = {
        chainId: v.chainId,
        decimals: isNFT ? 0 : v.tokenInfo?.decimals,
        address: isNFT ? v?.nftInfo?.tokenContractAddress : v?.tokenInfo?.tokenContractAddress,
        symbol: v.symbol,
        name: v.symbol,
        imageUrl: isNFT ? v.nftInfo?.imageUrl : v.tokenInfo?.imageUrl,
        alias: isNFT ? v.nftInfo?.alias : '',
        tokenId: isNFT ? v.nftInfo?.tokenId : '',
        toDetail: {
          // TOOD
          name: 'david',
          // name: toMemberRef.current?.name,
          // address: toMemberRef.current?.address,
          // TODO
          address: `ELF_2TVYbANhHescw268j3vEFNayuB3URKWmwDQs9PTx9d7tCxMkkB_AELF`,
        },
        from: {
          channelUuid,
          isGroup: true,
        },
      };
      navigate(`/send/${type}/${v.symbol}`, { state });
    },
    [channelUuid, navigate],
  );
  const renderMemberList = useMemo(
    () => (
      <div className="member-list">
        {showMemberList?.map((m) => (
          <div className="flex member-item" key={m.relationId} onClick={() => handleClickMember(m)}>
            <Avatar avatarSize="small" src={m.avatar} letter={m.name.slice(0, 1).toUpperCase()} />
            <div className="member-name">{m.name}</div>
          </div>
        ))}
      </div>
    ),
    [handleClickMember, showMemberList],
  );
  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const _value = e.target.value;
      setInputValue(_value);
      searchDebounce(_value);
    },
    [searchDebounce],
  );
  useEffect(() => {
    const _v = state?.search ?? '';
    setFilterWord(_v);
    setInputValue(_v);
    handleSearch(_v);
  }, [handleSearch, state?.search]);
  useEffectOnce(() => {
    refresh();
  });

  return (
    <div className="member-list-page flex-column-between">
      <div className="member-list-top">
        <SettingHeader
          title={t('Select Group Members')}
          leftCallBack={() => navigate(`/chat-box-group/${channelUuid}`)}
          rightElement={<CustomSvg type="Close2" onClick={() => navigate(`/chat-box-group/${channelUuid}`)} />}
        />
        <DropdownSearch
          overlay={<></>}
          value={inputValue}
          inputProps={{
            onChange: handleInputChange,
            placeholder: 'Search',
          }}
        />
      </div>
      <div className="member-list-container">
        {showMemberList.length !== 0 ? (
          renderMemberList
        ) : (
          <div className="empty flex-center">{filterWord ? 'No search result' : 'No members'}</div>
        )}
      </div>
      <CustomTokenDrawer
        open={assetsOpen}
        drawerType={'send'}
        title={'Select Assets'}
        searchPlaceHolder={'Search Assets'}
        height="528"
        maskClosable={true}
        placement="bottom"
        filterChain={['AELF']}
        onClose={() => setAssetsOpen(false)}
        onChange={handleSelectAssets}
      />
    </div>
  );
}
