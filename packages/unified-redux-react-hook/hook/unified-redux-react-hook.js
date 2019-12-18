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

  const equalityFunctions = {
    deep:       (a, b) => fastEqual(a, b, {shallow: false}),
    shallow_d1: (a, b) => fastEqual(a, b, {shallow: true, depth: 1}),
    shallow_d2: (a, b) => fastEqual(a, b, {shallow: true, depth: 2})
  }

  const createReduxSelector = (...selectorFunctions) => {
    // https://github.com/reduxjs/reselect#api

    const reduxSelectorProperty = 'UnifiedReduxReactHook_ReduxSelector'

    const equality = {
      forceUpdate: null,
      recalculate: null
    }

    if (selectorFunctions && selectorFunctions.length) {
      let options = selectorFunctions[selectorFunctions.length - 1]

      if (options && (typeof options === 'object')) {
        // remove value so it isn't processed within the `reduxSelector` as an `arg`
        selectorFunctions.pop()

        if (options.equality) {
          if ((typeof options.equality === 'string') || (typeof options.equality === 'number'))
            options.equality = {forceUpdate: options.equality, recalculate: options.equality}

          if (typeof options.equality === 'object') {
            if ((typeof options.equality.forceUpdate === 'string') || (typeof options.equality.forceUpdate === 'number'))
              options.equality.forceUpdate = selectorFunctions.map(() => options.equality.forceUpdate)

            if (Array.isArray(options.equality.forceUpdate)) {
              let count = selectorFunctions.length - 1

              if (count > 0)
                equality.forceUpdate = []

              for (let i=0; i < count; i++) {
                if (i >= options.equality.forceUpdate.length)
                  equality.forceUpdate[i] = null
                else if (typeof options.equality.forceUpdate[i] === 'number')
                  equality.forceUpdate[i] = (a, b) => fastEqual(a, b, {shallow: true, depth: parseInt(options.equality.forceUpdate[i])})
                else if (typeof options.equality.forceUpdate[i] !== 'string')
                  equality.forceUpdate[i] = null
                else if (options.equality.forceUpdate[i].toLowerCase() === 'deep')
                  equality.forceUpdate[i] = equalityFunctions.deep
                else if (options.equality.forceUpdate[i].toLowerCase() === 'shallow')
                  equality.forceUpdate[i] = equalityFunctions.shallow_d1
                else
                  equality.forceUpdate[i] = null
              }
            }

            if (typeof options.equality.recalculate === 'number') {
              equality.recalculate = (a, b) => fastEqual(a, b, {shallow: true, depth: parseInt(options.equality.recalculate)})
            }
            if (typeof options.equality.recalculate === 'string') {
              options.equality.recalculate = options.equality.recalculate.toLowerCase()

              if (options.equality.recalculate === 'deep')
                equality.recalculate = equalityFunctions.deep
              else if (options.equality.recalculate === 'shallow')
                equality.recalculate = equalityFunctions.shallow_d2
            }
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
            // 'inputSelector'      [function]      will remain stable (by reference) until 'params' change.
            // 'inputSelectorValue' [derived value] is memoized on its 'state' input parameter; 'inputSelector' is only re-run when 'state' changes. The memoized result is returned during render until 'state' changes.

            let inputSelector      = useCallback(state => arg(state, ...params), params)
            let equalityFunction   = (Array.isArray(equality.forceUpdate) && (typeof equality.forceUpdate[i] === 'function')) ? equality.forceUpdate[i] : undefined
            let inputSelectorValue = useReduxMappedState(inputSelector, equalityFunction)

            inputSelectorValues.push(inputSelectorValue)
          }
        }
        else {
          inputSelectorValues.push(arg)
        }
      }

      let result
      if (!inputSelectorValues.length) {
        let equalityFunction = equality.recalculate

        if (typeof equalityFunction === 'function') {
          prevInputSelectorValues.current = []

          // adjust depth of 'shallow' preset
          if (equalityFunction === equalityFunctions.shallow_d2)
            equalityFunction = equalityFunctions.shallow_d1
        }
        else {
          equalityFunction = undefined
        }

        result = useReduxMappedState(useCallback(resultFunc, []), equalityFunction)
      }
      else {
        let equalityFunction = equality.recalculate

        if (typeof equalityFunction === 'function') {
          if (equalityFunction(prevInputSelectorValues.current, inputSelectorValues)) {
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
