"use client";

import AppDialog from "@/components/dialog";
import OrderPreviewDialogContent from "./content";

export default function OrderPreviewDialog() {
  return (
    <AppDialog name="orderPreview" title="Order preview">
      {(order) => <OrderPreviewDialogContent order={order} />}
    </AppDialog>
  );
}
