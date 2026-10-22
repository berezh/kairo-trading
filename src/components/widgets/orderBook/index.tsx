"use client";

import { useAppSelector } from "@/lib/hooks";
import WidgetFrame from "@/components/widgetFrame";
import styles from "./index.module.scss";

export default function OrderBookWidget() {
  const quotes = useAppSelector((state) => state.quotes.items);

  return (
    <WidgetFrame
      id="markets"
      title="Currency pairs"
      rightTitle={<span className={styles.sampleNotice}>Mock feed · simulated</span>}
    >
      <div className={styles.tableScroller}>
        <table className={styles.quotesTable}>
          <caption className={styles.visuallyHidden}>
            Simulated bid and ask prices for {quotes.length} currency pairs.
          </caption>
          <thead>
            <tr>
              <th scope="col">Pair</th>
              <th scope="col">Sell <span>(Bid)</span></th>
              <th scope="col">Buy <span>(Ask)</span></th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote) => (
              <tr key={quote.symbol}>
                <th scope="row">
                  <span className={styles.pairMark} aria-hidden="true">
                    {quote.symbol.slice(0, 3)}
                  </span>
                  {quote.symbol}
                </th>
                <td className={styles.sellPrice}>{quote.bid}</td>
                <td className={styles.buyPrice}>{quote.ask}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </WidgetFrame>
  );
}
