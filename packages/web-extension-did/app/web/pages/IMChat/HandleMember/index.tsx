import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useDebounceCallback } from '@portkey-wallet/hooks';
import SettingHeader from 'pages/components/SettingHeader';
import CustomSvg from 'components/CustomSvg';
import DropdownSearch from 'components/DropdownSearch';
import { Button, Modal, message } from 'antd';
import { useAddChannelMembers, useGroupChannelInfo, useRemoveChannelMembers } from '@portkey-wallet/hooks/hooks-ca/im';
import { useChatContactFlatList } from '@portkey-wallet/hooks/hooks-ca/contact';
import ContactListSelect, { IContactItemSelectProps } from '../components/ContactListSelect';
import { ChannelMemberInfo } from '@portkey-wallet/im';
import './index.less';

export default function HandleMember() {
  const { channelUuid, operate } = useParams();
  const { t } = useTranslation();
  const [filterWord, setFilterWord] = useState<string>('');
  const navigate = useNavigate();
  const [disabled, setDisabled] = useState(true);
  const allChatContact = useChatContactFlatList();
  const { groupInfo } = useGroupChannelInfo(`${channelUuid}`);
  const isAdd = useMemo(() => operate === 'add', [operate]);
  const addMemberApi = useAddChannelMembers(`${channelUuid}`);
  const removeMemberApi = useRemoveChannelMembers(`${channelUuid}`);
  const selectedContactRef = useRef<ChannelMemberInfo[]>([]);
  const formatChatContact: IContactItemSelectProps[] = useMemo(() => {
    if (isAdd) {
      return (
        allChatContact.map((m) => ({
          ...m,
          id: m.imInfo?.relationId,
          index: m.name?.slice(0, 1),
          selected: groupInfo?.members.some((item) => item.relationId === m.imInfo?.relationId),
          disable: groupInfo?.members.some((item) => item.relationId === m.imInfo?.relationId),
        })) || []
      );
    } else {
      return (
        groupInfo?.members
          .filter((m) => !m.isAdmin)
          .map((m) => ({
            name: m.name,
            id: m.relationId,
            index: m.name.slice(0, 1),
            avatar: '',
          })) || []
      );
    }
  }, [allChatContact, groupInfo?.members, isAdd]);
  const allContactRef = useRef<IContactItemSelectProps[]>(formatChatContact);
  const [showMemberList, setShowMemberList] = useState<IContactItemSelectProps[]>(formatChatContact);

  const handleSearch = useCallback((keyword: string) => {
    const res: IContactItemSelectProps[] = [];
    const _v = keyword.trim().toLowerCase();
    allContactRef.current.forEach((m) => {
      if (m?.caHolderInfo?.walletName) {
        if (
          m?.name?.trim().toLowerCase().includes(_v) ||
          m?.caHolderInfo?.walletName?.trim().toLowerCase().includes(_v)
        ) {
          res.push(m);
        }
      } else {
        if (m?.name?.trim().toLowerCase().includes(_v) || m?.imInfo?.name?.trim().toLowerCase().includes(_v)) {
          res.push(m);
        }
      }
    });
    setShowMemberList(res);
  }, []);
  const searchDebounce = useDebounceCallback(
    (params) => {
      const _v = params.trim();
      _v ? handleSearch(_v) : setShowMemberList(allContactRef.current || []);
    },
    [],
    500,
  );
  const handleOperate = useCallback(async () => {
    if (isAdd) {
      try {
        await addMemberApi(selectedContactRef.current!);
        navigate(-1);
      } catch (e) {
        message.error('Failed to add members');
        console.log('===Failed to add members', e);
      }
      return false;
    } else {
      return Modal.confirm({
        width: 320,
        content: t('Remove the group?'),
        className: 'remove-group-modal',
        autoFocusButton: null,
        icon: null,
        centered: true,
        okText: t('Yes'),
        cancelText: t('No'),
        onOk: async () => {
          try {
            await removeMemberApi(selectedContactRef.current?.map((item) => item.relationId) || []);
            navigate(-1);
          } catch (e) {
            message.error('Failed to remove members');
            console.log('===Failed to remove members', e);
          }
        },
      });
    }
  }, [addMemberApi, isAdd, navigate, removeMemberApi, t]);
  const clickAddItem = useCallback(
    (item: IContactItemSelectProps) => {
      const target = selectedContactRef?.current || [];
      if (target?.some((m) => m.relationId === item.imInfo?.relationId)) {
        selectedContactRef.current = target.filter((m) => m.relationId !== item.imInfo?.relationId);
      } else {
        target.push({
          isAdmin: false,
          name: item.name || '',
          relationId: item.imInfo?.relationId || '',
          avatar: '',
        });
        selectedContactRef.current = target;
      }
      const _v = showMemberList.map((m) => {
        if (m.imInfo?.relationId === item.imInfo?.relationId) {
          return {
            ...m,
            selected: !m.selected,
          };
        } else {
          return m;
        }
      });
      setShowMemberList(_v);
      allContactRef.current.forEach((m) => {
        if (m.imInfo?.relationId === item.imInfo?.relationId) {
          m.selected = !m.selected;
        }
      });
      setDisabled(!selectedContactRef?.current?.length);
    },
    [showMemberList],
  );
  const clickRemoveItem = useCallback(
    (item: IContactItemSelectProps) => {
      const target = selectedContactRef?.current || [];
      if (target?.some((m) => m.relationId === item.id)) {
        selectedContactRef.current = target.filter((m) => m.relationId !== item.id);
      } else {
        target.push({
          isAdmin: false,
          name: item.name || '',
          relationId: item.id || '',
          avatar: '',
        });
        selectedContactRef.current = target;
      }
      const _v = showMemberList.map((m) => {
        if (m.id === item.id) {
          return {
            ...m,
            selected: !m.selected,
          };
        } else {
          return m;
        }
      });
      setShowMemberList(_v);
      allContactRef.current.forEach((m) => {
        if (m.id === item.id) {
          m.selected = !m.selected;
        }
      });
      setDisabled(!selectedContactRef?.current?.length);
    },
    [showMemberList],
  );
  return (
    <div className="handle-member-page flex-column">
      <div className="handle-member-top">
        <SettingHeader
          title={t(`${isAdd ? 'Add' : 'Remove'} Members`)}
          leftCallBack={() => navigate(-1)}
          rightElement={<CustomSvg type="Close2" onClick={() => navigate(-1)} />}
        />
        <DropdownSearch
          overlay={<></>}
          value={filterWord}
          inputProps={{
            onChange: (e) => {
              const _value = e.target.value.trim();
              setFilterWord(_value);
              searchDebounce(_value);
            },
            placeholder: 'Search',
          }}
        />
      </div>
      <div className="member-list-container">
        {showMemberList.length !== 0 ? (
          <ContactListSelect list={showMemberList} clickItem={isAdd ? clickAddItem : clickRemoveItem} />
        ) : (
          <div className="flex-center member-list-empty">{filterWord ? 'No search found' : 'No contact result'}</div>
        )}
      </div>
      <div className="handle-member-btn flex-center" onClick={handleOperate}>
        <Button disabled={disabled} type="primary">
          {isAdd ? 'Add' : 'Remove'}
        </Button>
      </div>
    </div>
  );
}
