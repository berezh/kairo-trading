"use client";
import { useEffect, useEffectEvent, useMemo, useState, type MouseEvent } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { MarketSelectors } from "@/redux/units/market/selector";
import type { AssetPairRecord } from "@/interfaces/data";
import WidgetFrame from "@/components/widgets/frame";
import VirtualTable from "@/components/virtualTable";
import styles from "./index.module.scss";
import numeral from "numeral";
import classNames from "classnames";
import { MarketActions } from "@/redux/units/market/action";

interface AssetPairRecordExtended extends AssetPairRecord {
  isUpdated: boolean;
  change: number;
  spread: number;
  prevChange: number;
}

export default function OrderBookWidget() {
  const dispatch = useAppDispatch();
  const initData = useAppSelector(MarketSelectors.selectItems);
  const openItems = useAppSelector(MarketSelectors.selectOpenItems);
  const [data, setData] = useState<AssetPairRecordExtended[]>(() =>
    initData.map((record) => ({ ...record, isUpdated: false, change: 0, spread: Number(record.ask) - Number(record.bid), prevChange: 0 })),
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
        const prevMid = previous ? (Number(previous.ask) + Number(previous.bid)) / 2 : mid;
        const openingMid = openingRecord ? (Number(openingRecord.ask) + Number(openingRecord.bid)) / 2 : mid;

        const change = mid - openingMid;

        return {
          ...record,
          isUpdated,
          change,
          prevChange: mid - prevMid,
          spread: Number(record.ask) - Number(record.bid),
        };
      });
    });
  });

  useEffect(() => {
    const interval = setInterval(() => updateData(), 1000);

    return () => clearInterval(interval);
  }, [ openItems]);

  const handleSellClick = (event: MouseEvent<HTMLTableCellElement>, record: AssetPairRecord) => {
    event.stopPropagation();
    dispatch(MarketActions.setActive({ ...record, side: "sell" }));
  };

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
          let rowClassName = '';
          if(record.isUpdated) {
            rowClassName = record.prevChange > 0 ? styles.updatedPlus : styles.updatedMinus;
          };
          return (
            <tr
              key={key}
              {...rowProps}
              className={classNames(styles.row, rowClassName)}
              onClick={() => dispatch(MarketActions.setActive(record))}
            >
              <th scope="row">
                {record.symbol}
              </th>
              <td className={styles.sellPrice} onClick={(event) => handleSellClick(event, record)}>{record.bid}</td>
              <td className={styles.buyPrice}>{record.ask}</td>
              <td>{numeral(record.spread).format("0.[00000]")}</td>
              <td className={record.change > 0 ? styles.buyPrice : record.change < 0 ? styles.sellPrice : ""}>{numeral(record.change).format("0.[0000]%")}</td>
            </tr>
        );}}
      />
    </WidgetFrame>
  );
}
