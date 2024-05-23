import { useCallback, useMemo } from 'react';
import './index.less';
import CustomSvg from 'components/CustomSvg';
import { List } from 'antd';
import { useCommonState } from 'store/Provider/hooks';
import PromptFrame from 'pages/components/PromptFrame';
import { TNetworkItem } from '@portkey-wallet/types/types-ca/deposit';
import NetworkLogo from '../NetworkLogo';
export interface ISelectNetworkProps {
  onClose?: () => void;
  onClickItem?: (network: TNetworkItem) => void;
  networkList?: TNetworkItem[];
  type?: 'component' | 'page';
}
export default function SelectNetwork(props: ISelectNetworkProps) {
  const { isPrompt } = useCommonState();
  const { type = 'component', networkList, onClickItem, onClose } = props || {};
  const renderNotice = useMemo(() => {
    return (
      <div className="notice-container">
        <CustomSvg type="Info" />
        <span className="note-text">
          Note: Please select from the supported networks listed below. Sending USDT from other networks may result in
          the loss of your assets.
        </span>
      </div>
    );
  }, []);

  const renderList = useMemo(() => {
    return (
      <List
        className="network-list"
        // itemLayout="horizontal"
        dataSource={networkList}
        renderItem={(item) => (
          <List.Item
            className="select-network-list-item"
            onClick={() => {
              onClickItem?.(item);
            }}>
            <List.Item.Meta
              className="select-network-list-item-meta"
              avatar={<NetworkLogo network={item.network} />}
              title={<span className="network-name">{item.name}</span>}
              description={
                <div className="item-wrapper-text">
                  <span className="arrive-time">{`Arrival Time ≈ ${item.multiConfirmTime}`}</span>
                  <span className="confirm-times">{item.multiConfirm}</span>
                </div>
              }
            />
          </List.Item>
        )}
      />
    );
  }, [networkList, onClickItem]);
  const mainContent = useCallback(() => {
    return (
      <div className="deposit-select-network-container">
        <div className="group">
          <div className="wrapper">
            <CustomSvg
              type="LeftArrow"
              onClick={() => {
                onClose?.();
              }}
            />
            <div className="box">
              <span className="text">Select Network</span>
            </div>
          </div>
          <div className="section-2" />
        </div>
        <div className="body">
          {renderNotice}
          {renderList}
        </div>
      </div>
    );
  }, [onClose, renderList, renderNotice]);
  return <>{isPrompt && type === 'page' ? <PromptFrame content={mainContent()} /> : mainContent()}</>;
}