"use client";

import { Button, Form, InputNumber, Radio, Select } from "antd";
import type { OrderSide, OrderType } from "@/interfaces/order";
import { useEffect } from "react";
import { useAppSelector } from "@/redux/hooks";
import { MarketSelectors } from "@/redux/units/market/selector";
import { parsePairSymbol } from "@/utils/parsePairSymbol";
import WidgetFrame from "@/components/widgets/frame";
import styles from "./index.module.scss";
import { CommonSelectors } from "@/redux/units/common/selector";

type OrderFormValues = {
  symbol: string;
  side: OrderSide;
  quantity: number;
  orderType: OrderType;
  limitPrice?: number;
};

export default function CreateOrderWidget() {
  const [form] = Form.useForm<OrderFormValues>();
  const activeRecord = useAppSelector(MarketSelectors.activeRecord);
  const connected = useAppSelector(CommonSelectors.connected);

  useEffect(() => {
    if (activeRecord) {
      const side = activeRecord.side ?? "buy";
      const limitPrice = side === "buy" ? Number(activeRecord.ask) : Number(activeRecord.bid);
      form.setFieldsValue({ symbol: activeRecord.symbol, side, orderType: "limit", limitPrice });
    }
  }, [activeRecord, form]);

  const data = useAppSelector(MarketSelectors.selectItems);
  const symbol = Form.useWatch("symbol", form) ?? data[0]?.symbol;
  const side = Form.useWatch("side", form) ?? "buy";
  const orderType = Form.useWatch("orderType", form) ?? "market";
  const quantity = Form.useWatch("quantity", form);
  const limitPrice = Form.useWatch("limitPrice", form);
  const pricePrecision = symbol?.includes("JPY") ? 3 : 5;
  const priceStep = 10 ** -pricePrecision;
  const selectedQuote = data.find((quote) => quote.symbol === symbol);
  const referencePrice =
    selectedQuote && Number(side === "buy" ? selectedQuote.ask : selectedQuote.bid);
  const orderPrice = orderType === "limit" ? limitPrice : referencePrice;
  const total =
    typeof symbol === "string" && symbol.length > 0 &&
    typeof quantity === "number" && Number.isFinite(quantity) && quantity >= 1 &&
    typeof orderPrice === "number" && Number.isFinite(orderPrice) && orderPrice >= priceStep
      ? quantity * orderPrice
      : undefined;
  const exchangeSymbol = symbol ? parsePairSymbol(symbol).exchangeSymbol : undefined;

  const handleSubmit = (values: OrderFormValues) => {
    // message.success({
    //   content: values.orderType === "limit"
    //     ? `Mock ${values.side} limit order preview created for ${values.symbol} at ${values.limitPrice?.toFixed(pricePrecision)}. No real trade was placed.`
    //     : `Mock ${values.side} market order preview created for ${values.symbol}. No real trade was placed.`,
    //   duration: 4,
    // });
  };

  const buttonDisabled = !(typeof total === "number" && total > 0) || !connected;

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
          quantity: 10,
          orderType: "market",
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
            <Radio.Button className={styles.buyDirection} value="buy">Buy</Radio.Button>
            <Radio.Button className={styles.sellDirection} value="sell">Sell</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="Order type" name="orderType">
          <Select
            options={[
              { value: "market", label: "Market" },
              { value: "limit", label: "Limit" },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Limit price"
          name="limitPrice"
          className={orderType === "limit" ? undefined : styles.hidden}
          preserve={false}
          rules={ orderType === "limit" ? [
            { required: true, message: "Enter a limit price." },
            { type: "number", min: priceStep, message: "Limit price must be positive." },
          ] : []}
        >
          <InputNumber
            className={styles.orderInput}
            min={priceStep}
            step={priceStep}
            precision={pricePrecision}
          />
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
            step={1}
            precision={0}
            controls
          />
        </Form.Item>

        {referencePrice && (
          <div className={styles.orderReference}>
            <span>Current {side === "buy" ? "ask" : "bid"}</span>
            <strong className={side === "buy" ? styles.buyDirection : styles.sellDirection}>
              {referencePrice.toFixed(pricePrecision)}
            </strong>
          </div>
        )}

        <div className={styles.orderReference}>
          <span>Total {side === "buy" ? "buy" : "sell"}</span>
          <strong className={side === "buy" ? styles.buyDirection : styles.sellDirection}>
            {total !== undefined && Number.isFinite(total)
              ? `${total.toFixed(pricePrecision)} ${exchangeSymbol}`
              : "--"}
          </strong>
        </div>

        <Button
          className={`${styles.submitOrder} ${side === "buy" ? styles.buyDirection : styles.sellDirection}`}
          type="primary"
          htmlType="submit"
          block
          disabled={buttonDisabled}
        >
          Preview mock order
        </Button>
      </Form>

      <p className={styles.orderDisclaimer}>
        Simulated order only. No live trades will be placed.
      </p>
    </WidgetFrame>
  );
}
