/*
 * https://www.robinwieruch.de/react-hooks-fetch-data
 * https://developers.google.com/web/updates/2017/09/abortable-fetch
 */

const {useReducer, useEffect, useRef} = require('react')

const initial_state = {
  isLoading: false,
  isAborted: false,
  error:     null,
  data:      null,
  doAbort:   () => {throw new Error('Cannot abort during render. Fetch is asynchronous and begins after render completes.')}
}

const noop = () => {}

const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case 'INIT':
      if (state.isLoading)
        return state
      else
        return {...initial_state, doAbort: noop, ...action.payload}
    case 'ABORT':
      if (state.isAborted)
        return state
      else if (state.isLoading)
        return {...initial_state, doAbort: noop, ...action.payload}
      else
        return {...initial_state, doAbort: noop}
    case 'SUCCESS':
      return {...initial_state, doAbort: noop, ...action.payload}
    case 'ERROR':
      return {...initial_state, doAbort: noop, ...action.payload}
    default:
      return state
  }
}

const useFetch = (url) => {
  const [state, realDispatch] = useReducer(dataFetchReducer, {...initial_state})

  const [dispatch, cancelPendingDispatches] = useNextTick(realDispatch)

  useEffect(() => {
    let didCancel, controller, request, doAbort, response

    didCancel = false

    if (!url) {
      dispatch({type: 'INIT', payload: {}})
      return
    }

    if (window.AbortController && window.Request) {
      controller = new AbortController()
      request    = new Request(url, {signal: controller.signal})
    }
    else {
      controller = null
      request    = url
    }

    doAbort = () => {
      if (controller)
        controller.abort()
      didCancel = true
      cancelPendingDispatches()
      dispatch({type: 'ABORT', payload: {isAborted: true}})
    }

    dispatch({type: 'INIT', payload: {isLoading: true, doAbort}})

    const fetchData = async () => {
      try {
        if (!didCancel)
          response = await fetch(request)
        if (!didCancel)
          response = await response.text()
        if (!didCancel)
          dispatch({type: 'SUCCESS', payload: {data: response}})
      }
      catch(error) {
        if (!didCancel) {
          if (error.name === 'AbortError')
            dispatch({type: 'ABORT', payload: {isAborted: true}})
          else
            dispatch({type: 'ERROR', payload: {error}})
        }
      }
    }
    fetchData()

    return doAbort
  }, [url])

  return state
}

const useNextTick = (fn) => {
  const timers = useRef([])

  const startTimer  = (...args) => {
    timers.current.push(
      setTimeout(
        () => {fn(...args)},
        0
      )
    )
  }

  const cancelPreviousTimers = () => {
    let timer

    while (timers.current.length) {
      timer = timers.current.pop()
      clearTimeout(timer)
    }
  }

  return [startTimer, cancelPreviousTimers]
}

module.exports = useFetch
