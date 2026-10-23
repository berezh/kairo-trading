"use client";
import { useEffect, useEffectEvent, useMemo, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { MarketSelectors } from "@/redux/units/market/selector";
import type { AssetPairRecord } from "@/interfaces/data";
import WidgetFrame from "@/components/widgets/frame";
import VirtualTable from "@/components/virtualTable";
import styles from "./index.module.scss";
import numeral from "numeral";
import classNames from "classnames";
import { MarketActions } from "@/redux/units/market/action";
import RowPriceChart from "./chart";
import { Input } from "antd";

export interface AssetPairRecordExtended extends AssetPairRecord {
  isUpdated: boolean;
  change: number;
  mid: number;
  spread: number;
  prevChange: number;
}

export default function OrderBookWidget() {
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState("");
  const initData = useAppSelector(MarketSelectors.records);
  const openItems = useAppSelector(MarketSelectors.openRecords);
  const [data, setData] = useState<AssetPairRecordExtended[]>(() =>
    initData.map((record) => ({ ...record, isUpdated: false, change: 0, spread: Number(record.ask) - Number(record.bid), prevChange: 0, mid: (Number(record.ask) + Number(record.bid)) / 2 })),
  );
  
  const updatedCount = useMemo(()=> data.filter(record => record.isUpdated).length, [data]);
  const filteredData = useMemo(() => {
    const query = search.trim().toUpperCase();
    return data.filter((record) => record.symbol.toUpperCase().includes(query));
  }, [data, search]);

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
        const prevMid = previous?.mid || mid;
        const openingMid = openingRecord ? (Number(openingRecord.ask) + Number(openingRecord.bid)) / 2 : mid;

        const change = mid - openingMid;

        return {
          ...record,
          isUpdated,
          change,
          prevChange: mid - prevMid,
          spread: Number(record.ask) - Number(record.bid),
          mid,
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
      rightTitle={
        <div className={styles.headerControls}>
          <div className={styles.updateCount}>{updatedCount ? `(${updatedCount} updated / sec)` : ""}</div>
          <Input
            className={styles.symbolSearch}
            aria-label="Search symbols"
            placeholder="Search symbols"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            allowClear
          />
        </div>
      }
      contentClassName={styles.widgetContent}
    >
      <VirtualTable<AssetPairRecordExtended>
        className={styles.virtualTable}
        items={filteredData}
        columnCount={6}
        getItemKey={(x) => x.symbol}
        renderHeader={(rowProps) => (
          <tr {...rowProps}>
            <th scope="col">Pair</th>
            <th scope="col">Sell <span className={styles.headerHint}>(Bid)</span></th>
            <th scope="col">Buy <span className={styles.headerHint}>(Ask)</span></th>
            <th scope="col">Spread</th>
            <th scope="col">Opening</th>
            <th scope="col">Chart</th>
          </tr>
        )}
        renderRow={({ key, ...rowProps }, record) => {
          let rowClassName = '';
          if(record.isUpdated && record.prevChange !== 0) {
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
              <td className={styles.sellPrice}>
                <button
                  type="button"
                  className={styles.priceAction}
                  aria-label={`Sell ${record.symbol} at ${record.bid}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    dispatch(MarketActions.setActive({ ...record, side: "sell" }));
                  }}
                >
                  {record.bid}
                </button>
              </td>
              <td className={styles.buyPrice}>
                <button
                  type="button"
                  className={styles.priceAction}
                  aria-label={`Buy ${record.symbol} at ${record.ask}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    dispatch(MarketActions.setActive({ ...record, side: "buy" }));
                  }}
                >
                  {record.ask}
                </button>
              </td>
              <td>{numeral(record.spread).format("0.[00000]")}</td>
              <td className={record.change > 0 ? styles.buyPrice : record.change < 0 ? styles.sellPrice : ""}>{numeral(record.change).format("0.[0000]%")}</td>
              <td><RowPriceChart record={record} /></td>
            </tr>
        );}}
      />
    </WidgetFrame>
  );
}
