import {combineReducers, configureStore} from "@reduxjs/toolkit";
import AuthReducer from "./slices/AuthSlice";
import LoadingReducer from "./slices/LoadingSlice";
import ScreenSizeReducer from "./slices/ScreenSizeSlice";
import SidebarReducer from "./slices/SidebarSlice";
import UserReducer from "./slices/UserSlice";
import OptionReducer from "./slices/OptionSlice";
import CustomerRequestReducer from "./slices/CustomerRequestSlice";
import NotificationReducer from "./slices/notificationSlice";
import storage from "redux-persist/lib/storage";
import {persistReducer, persistStore} from "redux-persist";

const routerReducer = combineReducers({
  auth: AuthReducer,
  loading: LoadingReducer,
  screen_size: ScreenSizeReducer,
  sidebar_expand: SidebarReducer,
  user: UserReducer,
  options: OptionReducer,
  customer_request_data: CustomerRequestReducer,
  notification: NotificationReducer
})

const persistConfig = {
  key: 'root',
  storage,
}

const persistedReducer = persistReducer(persistConfig, routerReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    })
})

export const persistor = persistStore(store)

export type AppStore = typeof store
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
