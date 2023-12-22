import React, { useMemo } from 'react';
import clsx from 'clsx';
import { IMessage } from '../type';
import TransferBody from './TransferBody';

const TransferMessage: React.FC<IMessage> = (props) => {
  const temp = 'xxx';
  const subtitle = useMemo(() => {
    if (props.isGroup) return `Transfer to ${temp}`;

    if (props.position === 'right') return `Transfer to ${temp}`;

    return `Receive from ${temp}`;
  }, [props.isGroup, props.position]);

  return (
    <div className="portkey-message-transfer">
      <div className={clsx(['transfer-message-body', 'flex', props.position])}>
        <TransferBody amount="999,999.0000" symbol="ELF" subtitle={subtitle} />
      </div>
    </div>
  );
};

export default TransferMessage;
