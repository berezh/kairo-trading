"use client";

import AppDialog from "@/components/dialog";
import PriceConfirmationDialogContent from "./content";

export default function PriceConfirmationDialog() {
  return (
    <AppDialog name="priceConfirmation" title="Price confirmation">
      {(data) => <PriceConfirmationDialogContent {...data} />}
    </AppDialog>
  );
}
