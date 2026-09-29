import { configureStore } from '@reduxjs/toolkit'
import cityReducer from './slices/citySlice'
import venuesReducer from './slices/venuesSlice'

export const store = configureStore({
  reducer: {
    city: cityReducer,
    venues: venuesReducer
  }
})

