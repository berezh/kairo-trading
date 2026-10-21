import styles from "./page.module.scss";

type Quote = {
  symbol: string;
  bid: string;
  ask: string;
  ts: number;
  seq: number;
};

const sampleTimestamp = 1759830930123;

const sampleQuotes: Quote[] = [
  { symbol: "EURUSD", bid: "1.08412", ask: "1.08415", ts: sampleTimestamp, seq: 98213 },
  { symbol: "USDJPY", bid: "149.382", ask: "149.386", ts: sampleTimestamp, seq: 98214 },
  { symbol: "GBPUSD", bid: "1.29740", ask: "1.29745", ts: sampleTimestamp, seq: 98215 },
  { symbol: "USDCHF", bid: "0.86521", ask: "0.86525", ts: sampleTimestamp, seq: 98216 },
  { symbol: "AUDUSD", bid: "0.66182", ask: "0.66186", ts: sampleTimestamp, seq: 98217 },
  { symbol: "USDCAD", bid: "1.37642", ask: "1.37647", ts: sampleTimestamp, seq: 98218 },
  { symbol: "NZDUSD", bid: "0.60124", ask: "0.60129", ts: sampleTimestamp, seq: 98219 },
  { symbol: "EURGBP", bid: "0.83562", ask: "0.83567", ts: sampleTimestamp, seq: 98220 },
  { symbol: "EURJPY", bid: "161.972", ask: "161.978", ts: sampleTimestamp, seq: 98221 },
  { symbol: "GBPJPY", bid: "193.821", ask: "193.829", ts: sampleTimestamp, seq: 98222 },
  { symbol: "AUDJPY", bid: "98.842", ask: "98.848", ts: sampleTimestamp, seq: 98223 },
  { symbol: "EURCHF", bid: "0.93814", ask: "0.93820", ts: sampleTimestamp, seq: 98224 },
  { symbol: "EURAUD", bid: "1.63820", ask: "1.63828", ts: sampleTimestamp, seq: 98225 },
  { symbol: "EURCAD", bid: "1.49218", ask: "1.49226", ts: sampleTimestamp, seq: 98226 },
  { symbol: "EURNZD", bid: "1.80264", ask: "1.80276", ts: sampleTimestamp, seq: 98227 },
  { symbol: "GBPCHF", bid: "1.12248", ask: "1.12256", ts: sampleTimestamp, seq: 98228 },
  { symbol: "GBPAUD", bid: "1.96018", ask: "1.96028", ts: sampleTimestamp, seq: 98229 },
  { symbol: "GBPCAD", bid: "1.78602", ask: "1.78612", ts: sampleTimestamp, seq: 98230 },
  { symbol: "GBPNZD", bid: "2.15730", ask: "2.15744", ts: sampleTimestamp, seq: 98231 },
  { symbol: "AUDCAD", bid: "0.91108", ask: "0.91115", ts: sampleTimestamp, seq: 98232 },
  { symbol: "AUDCHF", bid: "0.57248", ask: "0.57254", ts: sampleTimestamp, seq: 98233 },
  { symbol: "AUDNZD", bid: "1.10072", ask: "1.10080", ts: sampleTimestamp, seq: 98234 },
  { symbol: "CADJPY", bid: "108.544", ask: "108.551", ts: sampleTimestamp, seq: 98235 },
  { symbol: "CHFJPY", bid: "172.654", ask: "172.663", ts: sampleTimestamp, seq: 98236 },
  { symbol: "NZDJPY", bid: "89.842", ask: "89.850", ts: sampleTimestamp, seq: 98237 },
  { symbol: "CADCHF", bid: "0.62840", ask: "0.62847", ts: sampleTimestamp, seq: 98238 },
  { symbol: "NZDCAD", bid: "0.82762", ask: "0.82770", ts: sampleTimestamp, seq: 98239 },
  { symbol: "NZDCHF", bid: "0.52018", ask: "0.52025", ts: sampleTimestamp, seq: 98240 },
  { symbol: "USDSGD", bid: "1.30214", ask: "1.30222", ts: sampleTimestamp, seq: 98241 },
  { symbol: "EURSGD", bid: "1.41246", ask: "1.41258", ts: sampleTimestamp, seq: 98242 },
];

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a className={styles.brand} href="#overview" aria-label="Kairo Trading home">
          <span className={styles.brandMark} aria-hidden="true">
            k
          </span>
          <span>KAIRO TRADING</span>
        </a>
        <nav className={styles.nav} aria-label="Main navigation">
          <a href="#overview">Overview</a>
          <a href="#markets">Market tools</a>
        </nav>
        <a className={styles.headerAction} href="#workspace">
          Open workspace
        </a>
      </header>

      <main className={styles.content}>
        <section className={styles.markets} id="markets" aria-labelledby="markets-title">
          <div className={styles.marketHeading}>
            <div>
              <p className={styles.panelEyebrow}>Market watch</p>
              <h2 className={styles.marketsTitle} id="markets-title">
                Currency pairs
              </h2>
            </div>
            <span className={styles.sampleNotice}>Sample prices · not live</span>
          </div>

          <div className={styles.tableScroller}>
            <table className={styles.quotesTable}>
              <caption className={styles.visuallyHidden}>
                Sample bid and ask prices for 30 currency pairs. Prices are not live.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Pair</th>
                  <th scope="col">Sell <span>(Bid)</span></th>
                  <th scope="col">Buy <span>(Ask)</span></th>
                </tr>
              </thead>
              <tbody>
                {sampleQuotes.map((quote) => (
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
        </section>
      </main>

      <footer className={styles.footer}>
        <span>Kairo Trading</span>
        <span>Thoughtful tools for the markets.</span>
      </footer>
    </div>
  );
}
