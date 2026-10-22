"use client";
import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { MarketSelectors } from "@/redux/features/market";
import type { AssetPairRecord } from "@/interfaces/data";
import WidgetFrame from "@/components/widgets/frame";
import VirtualTable from "@/components/virtualTable";
import styles from "./index.module.scss";

interface AssetPairRecordExtended extends AssetPairRecord {
  prevTs: number;
}

export default function OrderBookWidget() {
  const initData = useAppSelector(MarketSelectors.selectItems);
  const [data, setData] = useState<AssetPairRecordExtended[]>(() =>
    initData.map((record) => ({ ...record, prevTs: record.ts })),
  );
  const latestData = useRef(initData);
  const appliedData = useRef(initData);

  useEffect(() => {
    latestData.current = initData;
  }, [initData]);

  useEffect(() => {
    const interval = setInterval(() => {
      const snapshot = latestData.current;
      if (snapshot === appliedData.current) return;

      appliedData.current = snapshot;
      setData((previousData) => {
        const previousBySymbol = new Map(
          previousData.map((record) => [record.symbol, record]),
        );

        return snapshot.map((record) => {
          const previous = previousBySymbol.get(record.symbol);

          return {
            ...record,
            prevTs: previous?.ts ?? record.ts,
          };
        });
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <WidgetFrame
      id="markets"
      title="Currency pairs"
      contentClassName={styles.widgetContent}
    >
      <VirtualTable<AssetPairRecordExtended>
        className={styles.virtualTable}
        items={data}
        columnCount={3}
        getItemKey={(x) => x.symbol}
        renderHeader={(rowProps) => (
          <tr {...rowProps}>
            <th scope="col">Pair</th>
            <th scope="col">Sell <span className={styles.headerHint}>(Bid)</span></th>
            <th scope="col">Buy <span className={styles.headerHint}>(Ask)</span></th>
          </tr>
        )}
        renderRow={({ key, ...rowProps }, record) => (
          <tr
            key={key}
            {...rowProps}
            className={record.prevTs !== record.ts ? styles.updated : ""}
          >
            <th scope="row">
              <span className={styles.pairMark} aria-hidden="true">
                {record.symbol.slice(0, 3)}
              </span>
              {record.symbol}
            </th>
            <td className={styles.sellPrice}>{record.bid}</td>
            <td className={styles.buyPrice}>{record.ask}</td>
          </tr>
        )}
      />
    </WidgetFrame>
  );
}
