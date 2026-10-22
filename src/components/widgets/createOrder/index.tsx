"use client";

import { App, Button, Form, InputNumber, Radio, Select } from "antd";
import { useAppSelector } from "@/redux/hooks";
import { MarketSelectors } from "@/redux/features/market";
import WidgetFrame from "@/components/widgets/frame";
import styles from "./index.module.scss";

type OrderFormValues = {
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
};

export default function CreateOrderWidget() {
  const [form] = Form.useForm<OrderFormValues>();
  const { message } = App.useApp();
  const data = useAppSelector(MarketSelectors.selectItems);
  const symbol = Form.useWatch("symbol", form) ?? data[0]?.symbol;
  const side = Form.useWatch("side", form) ?? "buy";
  const selectedQuote = data.find((quote) => quote.symbol === symbol);
  const referencePrice =
    selectedQuote && Number(side === "buy" ? selectedQuote.ask : selectedQuote.bid);

  const handleSubmit = (values: OrderFormValues) => {
    message.success({
      content: `Mock ${values.side} order preview created for ${values.symbol}. No real trade was placed.`,
      duration: 4,
    });
  };

  return (
    <WidgetFrame
      title="Create order"
    >
      <Form<OrderFormValues>
        form={form}
        layout="vertical"
        initialValues={{
          symbol: data[0]?.symbol,
          side: "buy",
          quantity: 1000,
        }}
        requiredMark={false}
        onFinish={handleSubmit}
      >
        <Form.Item
          label="Market pair"
          name="symbol"
          rules={[{ required: true, message: "Select a market pair." }]}
        >
          <Select
            showSearch
            optionFilterProp="label"
            options={data.map((quote) => ({
              value: quote.symbol,
              label: quote.symbol,
            }))}
          />
        </Form.Item>

        <Form.Item label="Direction" name="side">
          <Radio.Group className={styles.orderDirection} buttonStyle="solid">
            <Radio.Button value="buy">Buy</Radio.Button>
            <Radio.Button value="sell">Sell</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="Quantity"
          name="quantity"
          rules={[
            { required: true, message: "Enter an order quantity." },
            { type: "number", min: 1, message: "Quantity must be at least 1." },
          ]}
        >
          <InputNumber
            className={styles.orderInput}
            min={1}
            step={1000}
            precision={0}
            controls
          />
        </Form.Item>

        {referencePrice && (
          <div className={styles.orderReference}>
            <span>Current {side === "buy" ? "ask" : "bid"}</span>
            <strong>{referencePrice.toFixed(symbol?.includes("JPY") ? 3 : 5)}</strong>
          </div>
        )}

        <Button className={styles.submitOrder} type="primary" htmlType="submit" block>
          Preview mock order
        </Button>
      </Form>

      <p className={styles.orderDisclaimer}>
        Simulated order only. No live trades will be placed.
      </p>
    </WidgetFrame>
  );
}
