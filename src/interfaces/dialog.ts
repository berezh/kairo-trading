import type { OrderSide, OrderType } from "./order";

export interface OrderPreviewData {
  symbol: string;
  side: OrderSide;
  orderType: OrderType;
  quantity: number;
  price: number;
  precision: number;
}

export interface DialogData {
  orderPreview: OrderPreviewData;
  priceConfirmation: {
    order: OrderPreviewData;
    price: number;
  };
}

export type DialogName = keyof DialogData;

export type ShowDialogPayload = {
  [TName in DialogName]: { name: TName; data: DialogData[TName] };
}[DialogName];
