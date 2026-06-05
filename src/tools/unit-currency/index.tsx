import React, { useState, useCallback } from 'react';
import { useTheme } from '../../theme';

const RATES: Record<string, number> = {
  CNY: 1,
  USD: 0.138,
  EUR: 0.126,
  JPY: 20.57,
  GBP: 0.108,
  KRW: 182.5,
  AUD: 0.208,
  CAD: 0.185,
  HKD: 1.079,
  CHF: 0.121,
  SGD: 0.184,
  TWD: 4.41,
};

const CURRENCIES: { key: string; label: string }[] = [
  { key: 'CNY', label: '人民币 (¥ CNY)' },
  { key: 'USD', label: '美元 ($ USD)' },
  { key: 'EUR', label: '欧元 (€ EUR)' },
  { key: 'JPY', label: '日元 (¥ JPY)' },
  { key: 'GBP', label: '英镑 (£ GBP)' },
  { key: 'KRW', label: '韩元 (₩ KRW)' },
  { key: 'AUD', label: '澳元 (A$ AUD)' },
  { key: 'CAD', label: '加元 (C$ CAD)' },
  { key: 'HKD', label: '港币 (HK$ HKD)' },
  { key: 'CHF', label: '瑞郎 (CHF)' },
  { key: 'SGD', label: '新加坡元 (S$ SGD)' },
  { key: 'TWD', label: '新台币 (NT$ TWD)' },
];

const UnitCurrency: React.FC = () => {
  const t = useTheme();
  const [fromCurrency, setFromCurrency] = useState('CNY');
  const [toCurrency, setToCurrency] = useState('USD');
  const [fromValue, setFromValue] = useState('1');

  const convert = useCallback(
    (amount: number, source: string, target: string): number => {
      const cnyAmount = amount / RATES[source];
      return cnyAmount * RATES[target];
    },
    [],
  );

  const fromNum = parseFloat(fromValue) || 0;
  const toNum = convert(fromNum, fromCurrency, toCurrency);

  const decimals = toCurrency === 'KRW' || toCurrency === 'JPY' ? 2 : 4;
  const rateDecimals = toCurrency === 'KRW' || toCurrency === 'JPY' ? 2 : 6;

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setFromValue(toNum.toFixed(decimals));
  };

  const handleCurrencyChange = (isFrom: boolean, newCurrency: string) => {
    if (isFrom) {
      if (newCurrency === toCurrency) {
        setToCurrency(fromCurrency);
      }
      setFromCurrency(newCurrency);
    } else {
      if (newCurrency === fromCurrency) {
        setFromCurrency(toCurrency);
      }
      setToCurrency(newCurrency);
    }
  };

  const styles = {
    wrapper: {
      padding: 20,
      fontFamily: "'Noto Sans SC', sans-serif",
      background: t.bg,
      minHeight: '100%',
      color: t.text,
    } as React.CSSProperties,
    row: {
      display: 'flex',
      gap: 12,
      alignItems: 'center',
      marginBottom: 8,
      flexWrap: 'wrap',
    } as React.CSSProperties,
    label: {
      color: t.textSecondary,
      fontSize: 13,
      marginBottom: 4,
      fontFamily: "'Noto Sans SC', sans-serif",
    } as React.CSSProperties,
    input: {
      background: t.inputBg,
      border: `0.5px solid ${t.border}`,
      borderRadius: 6,
      padding: '8px 12px',
      color: t.text,
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 15,
      width: 220,
      outline: 'none',
    } as React.CSSProperties,
    select: {
      background: t.inputBg,
      border: `0.5px solid ${t.border}`,
      borderRadius: 6,
      padding: '8px 12px',
      color: t.text,
      fontFamily: "'Noto Sans SC', sans-serif",
      fontSize: 14,
      outline: 'none',
      cursor: 'pointer',
      minWidth: 180,
    } as React.CSSProperties,
    swapBtn: {
      background: t.primary,
      color: '#fff',
      border: 'none',
      borderRadius: 6,
      padding: '8px 16px',
      margin: '12px auto',
      display: 'block',
      cursor: 'pointer',
      fontSize: 16,
      fontFamily: "'Noto Sans SC', sans-serif",
    } as React.CSSProperties,
    result: {
      textAlign: 'center',
      marginTop: 16,
      marginBottom: 8,
    } as React.CSSProperties,
    resultLabel: {
      color: t.textSecondary,
      fontSize: 13,
      marginBottom: 6,
      fontFamily: "'Noto Sans SC', sans-serif",
    } as React.CSSProperties,
    resultValue: {
      color: t.green,
      fontSize: 28,
      fontFamily: "'JetBrains Mono', monospace",
      fontWeight: 500,
    } as React.CSSProperties,
    rateLabel: {
      textAlign: 'center',
      color: t.textSecondary,
      fontSize: 12,
      fontFamily: "'JetBrains Mono', monospace",
      marginBottom: 16,
    } as React.CSSProperties,
    hint: {
      color: t.textHint,
      fontSize: 12,
      fontFamily: "'Noto Sans SC', sans-serif",
      textAlign: 'center',
      marginTop: 24,
    } as React.CSSProperties,
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.label}>源货币</div>
      <div style={styles.row}>
        <input
          type="number"
          style={styles.input}
          value={fromValue}
          onChange={(e) => setFromValue(e.target.value)}
          placeholder="输入金额"
        />
        <select
          style={styles.select}
          value={fromCurrency}
          onChange={(e) => handleCurrencyChange(true, e.target.value)}
        >
          {CURRENCIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <button style={styles.swapBtn} onClick={handleSwap}>
        ⇅ 交换
      </button>

      <div style={styles.label}>目标货币</div>
      <div style={styles.row}>
        <input
          type="number"
          style={styles.input}
          value={toNum.toFixed(decimals)}
          readOnly
          placeholder="转换结果"
        />
        <select
          style={styles.select}
          value={toCurrency}
          onChange={(e) => handleCurrencyChange(false, e.target.value)}
        >
          {CURRENCIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.result}>
        <div style={styles.resultLabel}>转换结果</div>
        <div style={styles.resultValue}>
          {fromNum > 0
            ? `${toNum.toFixed(decimals)} ${toCurrency}`
            : '—'}
        </div>
      </div>

      <div style={styles.rateLabel}>
        1 {fromCurrency} = {convert(1, fromCurrency, toCurrency).toFixed(rateDecimals)} {toCurrency}
      </div>

      <div style={styles.hint}>
        ⚠️ 汇率为固定参考值，实际交易请以银行实时汇率为准
      </div>
    </div>
  );
};

export default UnitCurrency;
