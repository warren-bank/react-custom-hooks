/*
 * https://www.robinwieruch.de/react-hooks-fetch-data
 * https://developers.google.com/web/updates/2017/09/abortable-fetch
 */

const {useReducer, useEffect} = require('react')

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
      else
        return {...initial_state, doAbort: noop, ...action.payload}
    case 'SUCCESS':
      return {...initial_state, doAbort: noop, ...action.payload}
    case 'ERROR':
      return {...initial_state, doAbort: noop, ...action.payload}
    default:
      return state
  }
}

const useFetch = (url) => {
  const [state, dispatch] = useReducer(dataFetchReducer, initial_state)

  useEffect(() => {
    let didCancel, request, doAbort, response

    didCancel = false

    if (!url) {
      dispatch({type: 'INIT', payload: {}})
      return
    }

    if (window.AbortController && window.Request) {
      const controller = new AbortController()
      const signal = controller.signal
      request = new Request(url, {signal})

      doAbort = () => {
        controller.abort()
        didCancel = true
        dispatch({type: 'ABORT', payload: {isAborted: true}})
      }
    }
    else {
      request = url
      doAbort = () => {
        didCancel = true
        dispatch({type: 'ABORT', payload: {isAborted: true}})
      }
    }

    dispatch({type: 'INIT', payload: {isLoading: true, doAbort}})

    const fetchData = async () => {
      try {
        response = await fetch(request)
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

module.exports = useFetch
