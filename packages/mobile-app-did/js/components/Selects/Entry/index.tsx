import React from 'react';
import { TNetworkItem, TTokenItem } from '@portkey-wallet/types/types-ca/deposit';
import OverlayModal from 'components/OverlayModal';
import { Keyboard } from 'react-native';
import { SelectNetworkModal } from '../SelectToken';

export interface ISelectBaseProps {
  networkList: TNetworkItem[];
  currentToken: TTokenItem;
  currentNetwork: TNetworkItem;
  onResolve: OnSelectFinishCallback;
  onReject: (reason?: any) => void;
}

export type ISelectTokenResult = {
  network: TNetworkItem;
  token: TTokenItem;
};

export const selectPayToken = (props: ISelectBaseProps): Promise<ISelectTokenResult> => {
  return new Promise((resolve, reject) => {
    Keyboard.dismiss();
    OverlayModal.show(
      <SelectNetworkModal
        {...props}
        onResolve={data => {
          resolve(data);
          OverlayModal.hide();
        }}
        onReject={reject}
        isPay={true}
      />,
      {
        position: 'bottom',
      },
    );
  });
};

export const selectReceiveToken = (props: ISelectBaseProps): Promise<ISelectTokenResult> => {
  return new Promise((resolve, reject) => {
    Keyboard.dismiss();
    OverlayModal.show(
      <SelectNetworkModal
        {...props}
        onResolve={data => {
          resolve(data);
          OverlayModal.hide();
        }}
        onReject={reject}
        isPay={false}
      />,
      {
        position: 'bottom',
      },
    );
  });
};

export type OnSelectFinishCallback = (data: ISelectTokenResult) => void;