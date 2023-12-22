import { AccountAssetItem } from '@portkey-wallet/types/types-ca/token';
import { DrawerProps } from 'antd';
import BaseDrawer from '../BaseDrawer';
import CustomTokenList from '../CustomTokenList';
import { ChainId } from '@portkey-wallet/types';
import './index.less';

interface CustomSelectProps extends DrawerProps {
  onChange?: (v: AccountAssetItem, type: 'token' | 'nft') => void;
  onClose?: () => void;
  searchPlaceHolder?: string;
  drawerType: 'send' | 'receive';
  filterChain?: ChainId[];
}

export default function CustomTokenDrawer({
  onChange,
  onClose,
  title,
  searchPlaceHolder,
  drawerType,
  filterChain,
  ...props
}: CustomSelectProps) {
  return (
    <BaseDrawer {...props} destroyOnClose onClose={onClose} className="custom-token-drawer">
      <CustomTokenList
        drawerType={drawerType}
        title={title}
        searchPlaceHolder={searchPlaceHolder}
        filterChain={filterChain}
        onClose={onClose}
        onChange={onChange}
      />
    </BaseDrawer>
  );
}
