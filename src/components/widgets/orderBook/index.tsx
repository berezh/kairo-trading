"use client";
import { useEffect, useEffectEvent, useMemo, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { MarketSelectors } from "@/redux/units/market/selector";
import type { AssetPairRecord } from "@/interfaces/data";
import WidgetFrame from "@/components/widgets/frame";
import VirtualTable from "@/components/virtualTable";
import styles from "./index.module.scss";
import numeral from "numeral";

interface AssetPairRecordExtended extends AssetPairRecord {
  isUpdated: boolean;
  change: number;
  spread: number;
}

export default function OrderBookWidget() {
  const initData = useAppSelector(MarketSelectors.selectItems);
  const openItems = useAppSelector(MarketSelectors.selectOpenItems);
  const [data, setData] = useState<AssetPairRecordExtended[]>(() =>
    initData.map((record) => ({ ...record, isUpdated: false, change: 0, spread: Number(record.ask) - Number(record.bid) })),
  );
  
  const updatedCount = useMemo(()=> data.filter(record => record.isUpdated).length, [data]);

  const updateData = useEffectEvent(() => {
    setData((previousData) => {
      const unchanged =
        previousData.length === initData.length &&
        previousData.every((previous, index) => {
          const current = initData[index];

          return (
            previous.symbol === current.symbol &&
            previous.seq === current.seq &&
            previous.ts === current.ts &&
            previous.bid === current.bid &&
            previous.ask === current.ask
          );
        });

      if (unchanged) return previousData;

      const previousBySymbol = new Map(
        previousData.map((record) => [record.symbol, record]),
      );

      return initData.map((record) => {
        const previous = previousBySymbol.get(record.symbol);
        const isUpdated = previous?.ts !== record.ts;

        const openingRecord = openItems.find(item => item.symbol === record.symbol);
        const mid = (Number(record.ask) + Number(record.bid)) / 2;
        const openingMid = openingRecord ? (Number(openingRecord.ask) + Number(openingRecord.bid)) / 2 : mid;

        const change = mid - openingMid;

        return {
          ...record,
          isUpdated,
          change,
          spread: Number(record.ask) - Number(record.bid),
        };
      });
    });
  });

  useEffect(() => {
    const interval = setInterval(() => updateData(), 1000);

    return () => clearInterval(interval);
  }, [ openItems]);

  return (
    <WidgetFrame
      id="markets"
      title="Watchlist"
      rightTitle={<div className={styles.updateCount}>{updatedCount ? `(${updatedCount} updated / sec)` : ""}</div>}
      contentClassName={styles.widgetContent}
    >
      <VirtualTable<AssetPairRecordExtended>
        className={styles.virtualTable}
        items={data}
        columnCount={4}
        getItemKey={(x) => x.symbol}
        renderHeader={(rowProps) => (
          <tr {...rowProps}>
            <th scope="col">Pair</th>
            <th scope="col">Sell <span className={styles.headerHint}>(Bid)</span></th>
            <th scope="col">Buy <span className={styles.headerHint}>(Ask)</span></th>
            <th scope="col">Spread</th>
            <th scope="col">Opening</th>
          </tr>
        )}
        renderRow={({ key, ...rowProps }, record) => {          
          return (
            <tr
              key={key}
              {...rowProps}
              className={record.isUpdated ? styles.updated : ""}
            >
              <th scope="row">
                {record.symbol}
              </th>
              <td className={styles.sellPrice}>{record.bid}</td>
              <td className={styles.buyPrice}>{record.ask}</td>
              <td>{numeral(record.spread).format("0.[00000]")}</td>
              <td className={record.change > 0 ? styles.buyPrice : record.change < 0 ? styles.sellPrice : ""}>{numeral(record.change).format("0.[0000]%")}</td>
            </tr>
        );}}
      />
    </WidgetFrame>
  );
}
