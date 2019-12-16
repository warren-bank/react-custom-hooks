const {createStore}  = require('redux')
const React          = require('react')
const ReactDOM       = require('react-dom')
const {StoreContext} = require('@warren-bank/unified-redux-react-hook')  // {StoreContext, addDispatch, removeDispatch, useDispatch, useReduxDispatch, useReduxMappedState, useReduxSelector}
const App            = require('./components/App')

const reduxInitialState = {todos: ['foo','bar','baz']}
const reduxReducer = (state = reduxInitialState, action) => {
  switch (action.type) {
    case 'REDUX_STORE':
      return {todos: [...state.todos, action.payload]}
    default:
      return state
  }
}
const reduxStore = createStore(reduxReducer)

ReactDOM.render(
  <StoreContext.Provider value={reduxStore}>
    <App />
  </StoreContext.Provider>,
  document.getElementById('root')
)
