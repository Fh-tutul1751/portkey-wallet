import SecondPageHeader from 'pages/components/SecondPageHeader';
import { ReactNode } from 'react';
import { Outlet } from 'react-router';
import './index.less';

export interface IGuardianProps {
  headerTitle: string;
  renderAddBtn?: ReactNode;
  renderGuardianList: ReactNode;
  renderGuardianTip?: ReactNode;
}

const GuardiansPrompt = ({ headerTitle, renderAddBtn, renderGuardianList, renderGuardianTip }: IGuardianProps) => {
  return (
    <div className="guardians-prompt flex">
      <div className="guardians-body">
        <SecondPageHeader
          className="guardians-header"
          paddingLeft={12}
          title={headerTitle}
          leftElement={false}
          rightElement={renderAddBtn}
        />
        <div className="guardians-content">{renderGuardianList}</div>
        <div className="guardians-tip">{renderGuardianTip}</div>
      </div>
      <Outlet />
    </div>
  );
};

export default GuardiansPrompt;
