"use client";

import { App, Button, Form, InputNumber, Radio, Select } from "antd";
import type { OrderSide, OrderType } from "@/interfaces/order";
import { useEffect, useMemo } from "react";
import { shallowEqual } from "react-redux";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { DialogActions } from "@/redux/units/dialog/action";
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
  const dispatch = useAppDispatch();
  const { message } = App.useApp();
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

  const symbols = useAppSelector(
    (state) => MarketSelectors.records(state).map((record) => record.symbol),
    shallowEqual,
  );
  const symbolOptions = useMemo(
    () => symbols.map((symbol) => ({ value: symbol, label: symbol })),
    [symbols],
  );
  const symbol = Form.useWatch("symbol", form) ?? symbols[0];
  const side = Form.useWatch("side", form) ?? "buy";
  const orderType = Form.useWatch("orderType", form) ?? "market";
  const quantity = Form.useWatch("quantity", form);
  const limitPrice = Form.useWatch("limitPrice", form);
  const pricePrecision = symbol?.includes("JPY") ? 3 : 5;
  const priceStep = 10 ** -pricePrecision;
  const selectedQuote = useAppSelector(MarketSelectors.liveRecord(symbol ?? ""));
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

  const baseSymbol = symbol ? parsePairSymbol(symbol).baseSymbol : undefined;

  const handleSubmit = (values: OrderFormValues) => {
    const quote = selectedQuote;
    const price = values.orderType === "limit"
      ? values.limitPrice
      : quote && Number(values.side === "buy" ? quote.ask : quote.bid);

    if (!connected || typeof price !== "number" || !Number.isFinite(price) ||
        price <= 0 || !Number.isFinite(values.quantity * price)) {
      message.error("Cannot preview this order. Check the connection and order price.");
      return;
    }

    dispatch(DialogActions.show({
      name: "orderPreview",
      data: {
        symbol: values.symbol,
        side: values.side,
        orderType: values.orderType,
        quantity: values.quantity,
        price,
        precision: values.symbol.includes("JPY") ? 3 : 5,
      },
    }));
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
          symbol: symbols[0],
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
            options={symbolOptions}
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
          <span>Estimated cost:</span>
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
          {side === "buy" ? "Buy" : "Sell"} {baseSymbol}
        </Button>
      </Form>
    </WidgetFrame>
  );
}
