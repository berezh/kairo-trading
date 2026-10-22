
import CreateOrderWidget from "../widgets/createOrder";
import OrderBookWidget from "../widgets/orderBook";
import styles from "./index.module.scss";

export default function Dashboard() {
  return (
    <div className={styles.tradingLayout}>
      <OrderBookWidget />
      <CreateOrderWidget />
    </div>
  );
}
