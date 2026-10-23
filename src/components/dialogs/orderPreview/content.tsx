"use client";

import { App, Button, Descriptions } from "antd";
import numeral from "numeral";
import { useCallback, useEffect } from "react";
import type { OrderPreviewData } from "@/interfaces/dialog";
import { useAppDispatch, useAppSelector, useAppStore } from "@/redux/hooks";
import { DialogActions } from "@/redux/units/dialog/action";
import { parsePairSymbol } from "@/utils/parsePairSymbol";
import { MarketSelectors } from "@/redux/units/market/selector";
import styles from "./content.module.scss";

export default function OrderPreviewDialogContent({ order }: { order: OrderPreviewData }) {
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const { message } = App.useApp();
  const { baseSymbol, exchangeSymbol } = parsePairSymbol(order.symbol);
  const total = (order.price * order.quantity).toFixed(order.precision);

  const liveRecord = useAppSelector(MarketSelectors.liveRecord(order.symbol));
  const livePrice = liveRecord
    ? Number(order.side === "buy" ? liveRecord.ask : liveRecord.bid)
    : undefined;
  const livePriceChange =
    livePrice !== undefined && Number.isFinite(livePrice) && livePrice > 0 &&
    Number.isFinite(order.price) && order.price > 0
      ? (livePrice - order.price) / order.price
      : undefined;
  const formattedPriceChange = livePriceChange !== undefined && Number.isFinite(livePriceChange)
    ? numeral(livePriceChange).format("0.[00]%")
    : "--";

  const requestPriceConfirmation = useCallback((price: number | undefined) => {
    if (store.getState().dialog.orderPreview !== order) {
      return false;
    }

    if (price === undefined || !Number.isFinite(price) || price <= 0) {
      return false;
    }

    const priceWorsened = order.side === "buy" ? price > order.price : price < order.price;
    if (!priceWorsened) {
      return false;
    }

    dispatch(DialogActions.show({
      name: "priceConfirmation",
      data: { order, price },
    }));
    return true;
  }, [dispatch, order, store]);

  useEffect(() => {
    requestPriceConfirmation(livePrice);
  }, [livePrice, requestPriceConfirmation]);

  const handleSubmit = () => {
    if (store.getState().dialog.orderPreview !== order) {
      return;
    }

    const quote = MarketSelectors.liveRecord(order.symbol)(store.getState());
    const price = quote ? Number(order.side === "buy" ? quote.ask : quote.bid) : undefined;

    if (price === undefined || !Number.isFinite(price) || price <= 0) {
      message.error("Cannot submit this order. A valid live quote is unavailable.");
      return;
    }

    if (requestPriceConfirmation(price)) {
      return;
    }

    message.success(`Order is submited. Total: ${total} ${exchangeSymbol}`);
    dispatch(DialogActions.hide("orderPreview"));
  };

  return (
    <>
      <Descriptions
        column={1}
        items={[
          { key: "symbol", label: "Market pair", children: order.symbol },
          { key: "side", label: "Direction", children: order.side === "buy" ? "Buy" : "Sell" },
          { key: "type", label: "Order type", children: order.orderType === "limit" ? "Limit" : "Market" },
          { key: "quantity", label: "Quantity", children: `${order.quantity} ${baseSymbol}` },
          { key: "price", label: order.orderType === "limit" ? "Limit price" : "Market price", children: `${order.price.toFixed(order.precision)} ${exchangeSymbol}` },
          { key: "livePriceChange", label: "Live price change", children: <span className={livePriceChange !== undefined && livePriceChange > 0 ? styles.buyPrice : livePriceChange !== undefined && livePriceChange < 0 ? styles.sellPrice : undefined}>{formattedPriceChange}</span> },
          { key: "total", label: "Estimated cost", children: `${total} ${exchangeSymbol}` },
        ]}
      />
      <br />
      <div className={styles.actions}>
        <Button
          className={`${styles.submitOrder} ${order.side === "buy" ? styles.buyDirection : styles.sellDirection}`}
          type="primary"
          onClick={handleSubmit}
          block
        >
          Submit {order.side === "buy" ? "Buy" : "Sell"}
        </Button>
        <Button onClick={() => dispatch(DialogActions.hide("orderPreview"))} block>
          Cancel
        </Button>
      </div>
    </>
  );
}
