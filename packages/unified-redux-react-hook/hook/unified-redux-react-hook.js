/*
 * https://github.com/facebookincubator/redux-react-hook
 * https://github.com/facebookincubator/redux-react-hook/issues/78
 */

{

  const {StoreContext, useDispatch: useReduxDispatch, useMappedState: useReduxMappedState} = require('redux-react-hook')

  const fastEqual = require('@warren-bank/fast-equal')

  const {useEffect, useRef, useCallback, useMemo} = require('react')

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

    let equal = null

    if (selectorFunctions && selectorFunctions.length) {
      let lastArg = selectorFunctions[selectorFunctions.length - 1]

      if (typeof lastArg === 'object') {
        // remove value so it isn't processed within the `reduxSelector` as an `arg`
        selectorFunctions.pop()

        if (typeof lastArg.equality === 'string') {
          switch (lastArg.equality.toLowerCase()) {
            case 'deep':
              equal = (a, b) => fastEqual(a, b, {shallow: false})
              break
            case 'shallow':
              equal = (a, b) => {
                // 'a' and 'b' are guaranteed to both be: Arrays, not equal by reference
                // the user doesn't want to shallow compare 'a' and 'b'
                // the user does want to shallow compare each element of both Arrays
                if (a.length !== b.length) return false

                let ok = true
                for (let i=0; ok && (i < a.length); i++) {
                  ok = fastEqual(a[i], b[i], {shallow: true})
                }
                return ok
              }
              break
          }
        }
      }
    }

    const reduxSelector = (...params) => {
      const args = [...selectorFunctions]

      if (!args || !args.length)
        return null

      const prevInputSelectorValues = useRef([])

      const resultFunc = args.pop()
      let inputSelectorValues = []

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
        if (typeof equal === 'function') {
          prevInputSelectorValues.current = []
        }

        result = useReduxMappedState(useCallback(resultFunc, []))
      }
      else {
        if (typeof equal === 'function') {
          if (equal(prevInputSelectorValues.current, inputSelectorValues)) {
            // force memoized reference equality
            inputSelectorValues = prevInputSelectorValues.current
          }
          else {
            prevInputSelectorValues.current = inputSelectorValues
          }
        }

        result = useMemo(() => resultFunc(...inputSelectorValues), inputSelectorValues)
      }
      return result
    }

    Object.defineProperty(reduxSelector, reduxSelectorProperty, {enumerable: false, configurable: false, writable: false, value: true})

    return reduxSelector
  }

  module.exports = {StoreContext, addDispatch, removeDispatch, useDispatch, useReduxDispatch, useReduxMappedState, createReduxSelector}

}
