import { configureStore, type UnknownAction } from "@reduxjs/toolkit";
import quotesReducer from "./features/quotes/quotesSlice";

type StoreState = {
  quotes: ReturnType<typeof quotesReducer>;
};

export const makeStore = () =>
  configureStore({
    reducer: (state: StoreState | undefined, action: UnknownAction): StoreState => ({
      quotes: quotesReducer(state?.quotes, action),
    }),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
