"use client";

import { Modal, type ModalProps } from "antd";
import type { ReactNode } from "react";
import type { DialogData, DialogName } from "@/interfaces/dialog";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { DialogActions } from "@/redux/units/dialog/action";
import { DialogSelectors } from "@/redux/units/dialog/selector";

type AppDialogProps<TName extends DialogName> = Omit<
  ModalProps,
  "open" | "onCancel" | "children" | "afterClose"
> & {
  name: TName;
  children: (data: DialogData[TName]) => ReactNode;
};

export default function AppDialog<TName extends DialogName>({
  name,
  children,
  ...props
}: AppDialogProps<TName>) {
  const dispatch = useAppDispatch();
  const data = useAppSelector((state) => DialogSelectors.data(state, name));

  return (
    <Modal
      footer={null}
      centered
      mask={{ closable: true }}
      destroyOnHidden
      {...props}
      open={data !== undefined}
      onCancel={() => dispatch(DialogActions.hide(name))}
    >
      {data !== undefined ? children(data) : null}
    </Modal>
  );
}
