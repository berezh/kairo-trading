import { useDispatch, useSelector, useStore } from "react-redux";
import type { AppDispatch, AppStore } from "./store";
import { ReduxStoreState } from "@/interfaces/state";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<ReduxStoreState>();
export const useAppStore = useStore.withTypes<AppStore>();
