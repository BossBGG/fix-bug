'use client'
import {Provider} from 'react-redux'
import {store, persistor} from '../redux/store'
import React from "react";
import {PersistGate} from "redux-persist/integration/react";

export default function StoreProvider({children}: {
  children: React.ReactNode
}) {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  )
}
