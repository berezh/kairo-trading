"use client";

import { useState } from "react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import type { AssetPairRecordExtended } from "../index";
import styles from "./index.module.scss";

const MAX_POINTS = 10;

interface PricePoint {
  mid: number;
  ts: number;
}

export default function RowPriceChart({ record }: { record: AssetPairRecordExtended }) {
  const { mid } = record;
  const [history, setHistory] = useState<{ symbol: string; points: PricePoint[] }>(() => ({
    symbol: record.symbol,
    points: [{ mid, ts: record.ts }],
  }));
  const lastPoint = history.points[history.points.length - 1];

  if (history.symbol !== record.symbol) {
    setHistory({ symbol: record.symbol, points: [{ mid, ts: record.ts }] });
  } else if (lastPoint.ts !== record.ts || lastPoint.mid !== mid) {
    setHistory({
      symbol: record.symbol,
      points: [...history.points, { mid, ts: record.ts }].slice(-MAX_POINTS),
    });
  }

  if(history.points.length < 2) {
    return null;
  }

  return (
    <div className={styles.chart} role="img" aria-label={`${record.symbol} midpoint price history`}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <LineChart data={history.points} margin={{ top: 3, right: 3, bottom: 3, left: 3 }} accessibilityLayer={false}>
          <XAxis dataKey="ts" type="number" domain={["dataMin", "dataMax"]} hide />
          <YAxis domain={["dataMin", "dataMax"]} hide />
          <Line
            dataKey="mid"
            type="linear"
            stroke={lastPoint.mid >= history.points[0].mid ? "var(--buy-color)" : "var(--sell-color)"}
            strokeWidth={1.5}
            dot={history.points.length === 1 ? { r: 2 } : false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
