import reducer, { initialState } from './reducers/'
import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleWare from 'redux-saga'
import rootSaga from './sagas'

export default function configureStore() {
  const sagaMiddleWare = createSagaMiddleWare()
  const store = createStore(
    reducer,
    initialState,
    applyMiddleware(sagaMiddleWare)
  )
  sagaMiddleWare.run(rootSaga)
  return store
}
