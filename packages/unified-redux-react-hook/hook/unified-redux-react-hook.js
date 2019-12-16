/*
 * https://github.com/facebookincubator/redux-react-hook
 * https://github.com/facebookincubator/redux-react-hook/issues/78
 */

{

  const {StoreContext, useDispatch: useReduxDispatch, useMappedState: useReduxMappedState} = require('redux-react-hook')

  const {useEffect, useCallback, useMemo} = require('react')

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

  const createReduxSelector = (...selectorFunctions) => {
    // https://github.com/reduxjs/reselect#api

    const reduxSelectorProperty = 'UnifiedReduxReactHook_ReduxSelector'

    const reduxSelector = (...params) => {
      const args = [...selectorFunctions]

      if (!args || !args.length)
        return null

      const resultFunc = args.pop()
      const inputSelectorValues = []

      for (let i=0; i < args.length; i++) {
        let arg = args[i]
        if (Array.isArray(arg)) {
          args.splice((i+1), 0, ...arg)
        }
        else if (typeof arg === 'function') {
          if (arg.hasOwnProperty(reduxSelectorProperty)) {
            let inputSelectorValue = arg(...params)

            inputSelectorValues.push(inputSelectorValue)
          }
          else {
          //let inputSelector      = useCallback(state => arg(state, ...params), params)  // result is memoized based only on 'params'; needs to run every time it is called in order to inspect 'state'.
            let inputSelector      = useCallback(state => arg(state, ...params))
            let inputSelectorValue = useReduxMappedState(inputSelector)

            inputSelectorValues.push(inputSelectorValue)
          }
        }
        else {
          inputSelectorValues.push(arg)
        }
      }

      let result
      if (!inputSelectorValues.length) {
        result = useReduxMappedState(useCallback(resultFunc, []))
      }
      else {
        result = useMemo(() => resultFunc(...inputSelectorValues), inputSelectorValues)
      }
      return result
    }

    Object.defineProperty(reduxSelector, reduxSelectorProperty, {enumerable: false, configurable: false, writable: false, value: true})

    return reduxSelector
  }

  module.exports = {StoreContext, addDispatch, removeDispatch, useDispatch, useReduxDispatch, useReduxMappedState, createReduxSelector}

}
