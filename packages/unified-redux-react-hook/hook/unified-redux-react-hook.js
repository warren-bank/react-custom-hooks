/*
 * https://github.com/facebookincubator/redux-react-hook
 * https://github.com/facebookincubator/redux-react-hook/issues/78
 */

{

const {StoreContext, useDispatch: useReduxDispatch, useMappedState: useReduxMappedState} = require('redux-react-hook')

const {useEffect} = require('react')

let reduxDispatcher

const reactDispatchers = []

const addDispatch = (dispatch) => {
  reactDispatchers.push(dispatch)

  return reactDispatchers.length
}

const removeDispatch = (dispatch) => {
  let index = reactDispatchers.indexOf(dispatch)
  if (index >= 0)
    reactDispatchers.splice(index, 1)

  return reactDispatchers.length
}

const unifiedDispatcher = (action) => {
  const dispatchers = [...reactDispatchers]

  if (reduxDispatcher)
    dispatchers.push(reduxDispatcher)

  dispatchers.forEach(dispatch => dispatch(action))
}

const useDispatch = (...newReactDispatchers) => {
  reduxDispatcher = useReduxDispatch()

  useEffect(() => {
    if (!newReactDispatchers || !newReactDispatchers.length)
      return

    const onMount = () => {
      newReactDispatchers.forEach(addDispatch)
    }

    const onDismount = () => {
      newReactDispatchers.forEach(removeDispatch)
    }

    onMount()
    return onDismount
  }, newReactDispatchers)

  return unifiedDispatcher
}

module.exports = {StoreContext, addDispatch, removeDispatch, useDispatch, useReduxDispatch, useReduxMappedState}

}
