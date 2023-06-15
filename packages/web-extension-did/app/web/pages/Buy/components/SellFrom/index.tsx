import CurrencyInput from '../CurrencyInput';
import TokenInput from '../TokenInput';
import { IBuyOrSellFromProps } from '../BuyFrom';

export default function SellFrom({
  currencyVal,
  handleCurrencyChange,
  handleCurrencyKeyDown,
  handleCurrencySelect,
  curFiat,

  tokenVal,
  handleTokenChange,
  handleTokenKeyDown,
  handleTokenSelect,
  curToken,

  errMsg,
}: IBuyOrSellFromProps) {
  const tokenChange = (val: string) => {
    const arr = val.split('.');
    // No more than eight digits after the decimal point
    if (arr[1]?.length > 8) return;
    // The total number does not exceed 13 digits, not include decimal point
    if (arr.join('').length > 13) return;

    handleTokenChange(val);
  };

  return (
    <>
      <div className="buy-input">
        <div className="label">{`I want to sell`}</div>
        <TokenInput
          value={tokenVal}
          onChange={tokenChange}
          readOnly={false}
          onKeyDown={handleTokenKeyDown}
          curToken={curToken}
          onSelect={handleTokenSelect}
        />
        {!!errMsg && <div className="error-text">{errMsg}</div>}
      </div>
      <div className="buy-input">
        <div className="label">{`I will receive≈`}</div>
        <CurrencyInput
          value={currencyVal}
          onChange={handleCurrencyChange}
          readOnly={true}
          onKeyDown={handleCurrencyKeyDown}
          curFiat={curFiat}
          onSelect={handleCurrencySelect}
        />
      </div>
    </>
  );
}
