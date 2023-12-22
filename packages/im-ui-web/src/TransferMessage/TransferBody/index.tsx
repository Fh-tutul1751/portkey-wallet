import CustomSvg from '../../components/CustomSvg';
import './index.less';

export interface ITransferBodyProps {
  amount: string | number;
  symbol: string;
  subtitle: string;
}

export default function TransferBody({ amount, symbol, subtitle }: ITransferBodyProps) {
  return (
    <div className="transfer-body flex">
      <CustomSvg type="Transfer" />
      <div className="transfer-container flex-column">
        <div className="container-title flex">
          <div className="container-title-amount">{amount}</div>
          <div className="container-title-symbol">{symbol}</div>
        </div>
        <div className="container-subtitle">{subtitle}</div>
      </div>
    </div>
  );
}
