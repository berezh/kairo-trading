
import CreateOrderWidget from "../widgets/createOrder";
import OrderBookWidget from "../widgets/orderBook";
import styles from "./index.module.scss";

export default function Dashboard() {
  return (
    <div className={styles.root}>
      <div className={styles.market}>
        <OrderBookWidget />
      </div>
      <div className={styles.order}>
        <CreateOrderWidget />
      </div>
    </div>
  );
}
