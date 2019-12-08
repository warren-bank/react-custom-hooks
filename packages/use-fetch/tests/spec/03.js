/*
   * https://www.robinwieruch.de/react-hooks-fetch-data
   * https://developers.google.com/web/updates/2017/09/abortable-fetch
   */

{
  const useFetch = require('@warren-bank/react-hook-use-fetch')
  const React    = require('react')
  const ReactDOM = require('react-dom')
  const expect   = require('expect')

  const data_URL = 'https://postman-echo.com/response-headers?access-control-allow-origin=*'

  let cumulative_progress = null
  let renderCount = -1
  let onRenderCallback = null
  const onRender = (cb) => {
    cb(renderCount)
  }

  let Component = () => {
    const {isLoading, isAborted, error, data, doAbort} = useFetch(data_URL)

    cumulative_progress = React.useRef({})
    React.useLayoutEffect(() => {
      let update = {}
      if (isLoading) update.isLoading = true
      if (isAborted) update.isAborted = true
      if (error)     update.error     = error
      if (data)      update.data      = data
      cumulative_progress.current = Object.assign(cumulative_progress.current, update)
    })

    React.useEffect(() => {
      renderCount++
      if (onRenderCallback) onRenderCallback()
    })

    return (
      //<div>{JSON.stringify(cumulative_progress)}</div>
      React.createElement('div', null, JSON.stringify(cumulative_progress.current))
    )
  }

  Component = React.createElement(Component)

  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
    container = null
  })

  it('can fetch a static text response', (done) => {
    ReactDOM.render(Component, container)

    onRenderCallback = onRender.bind(this, (renderCount) => {
      if (renderCount == 2) {
        try {
          const json = JSON.stringify(cumulative_progress.current)
          expect(json).to.equal('{"isLoading":true,"data":"{\\"access-control-allow-origin\\":\\"*\\"}"}')
          done()
        }
        catch(err) {
          done(err)
        }
      }
    })
  })

}
