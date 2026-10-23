"use client";

import { Button, Descriptions, Flex } from "antd";
import type { DialogData } from "@/interfaces/dialog";
import { useAppDispatch } from "@/redux/hooks";
import { DialogActions } from "@/redux/units/dialog/action";
import { parsePairSymbol } from "@/utils/parsePairSymbol";

export default function PriceConfirmationDialogContent({
  order,
  price,
}: DialogData["priceConfirmation"]) {
  const dispatch = useAppDispatch();
  const { exchangeSymbol } = parsePairSymbol(order.symbol);
  const formatPrice = (value: number) => `${value.toFixed(order.precision)} ${exchangeSymbol}`;

  return (
    <>
      <p>
        The live {order.side === "buy" ? "ask has increased" : "bid has decreased"}.
        Confirm the new price to review your order again.
      </p>
      <Descriptions
        column={1}
        items={[
          { key: "symbol", label: "Market pair", children: order.symbol },
          { key: "previous", label: "Previous price", children: formatPrice(order.price) },
          { key: "new", label: "New price", children: formatPrice(price) },
          { key: "total", label: "New estimated cost", children: formatPrice(price * order.quantity) },
        ]}
      />
      <Flex gap={12}>
        <Button
          type="primary"
          onClick={() => dispatch(DialogActions.show({
            name: "orderPreview",
            data: { ...order, price },
          }))}
          block
        >
          Confirm price change
        </Button>
        <Button onClick={() => dispatch(DialogActions.hide("priceConfirmation"))} block>
          Cancel
        </Button>
      </Flex>
    </>
  );
}
