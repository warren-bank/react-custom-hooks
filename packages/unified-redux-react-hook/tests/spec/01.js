/*
 * https://github.com/facebookincubator/redux-react-hook
 */

{
  const expect        = require('expect')
  const {createStore} = require('redux')
  const React         = require('react')
  const ReactDOM      = require('react-dom')
  const {StoreContext, addDispatch, removeDispatch, useDispatch, useReduxDispatch, useReduxMappedState, createReduxSelector} = require('@warren-bank/unified-redux-react-hook')

  // ===============================================================================================

  const reducer1 = (state, action) => {
    switch (action.type) {
      case 'LeafNode1':
        return [...state, action.payload];
      default:
        return state;
    }
  }

  const LeafNode1 = () => {
    const [state, dispatch] = React.useReducer(reducer1, [])
    useDispatch(dispatch)

    return (
      //<div>child 1: processed {state.length} React reducer dispatch actions</div>
      React.createElement('div', null, 'child 1: processed ' + JSON.stringify(state.length) + ' React reducer dispatch actions')
    )
  }

  // ===============================================================================================

  const reducer2 = (state, action) => {
    switch (action.type) {
      case 'LeafNode2':
        return [...state, action.payload];
      default:
        return state;
    }
  }

  const LeafNode2 = () => {
    const [state, dispatch] = React.useReducer(reducer2, [])
    useDispatch(dispatch)

    return (
      //<div>child 2: processed {state.length} React reducer dispatch actions</div>
      React.createElement('div', null, 'child 2: processed ' + JSON.stringify(state.length) + ' React reducer dispatch actions')
    )
  }

  // ===============================================================================================

  const reducer3 = (state, action) => {
    switch (action.type) {
      case 'LeafNode3':
        return [...state, action.payload];
      default:
        return state;
    }
  }

  const LeafNode3 = () => {
    const [state, dispatch] = React.useReducer(reducer3, [])
    useDispatch(dispatch)

    return (
      //<div>child 3: processed {state.length} React reducer dispatch actions</div>
      React.createElement('div', null, 'child 3: processed ' + JSON.stringify(state.length) + ' React reducer dispatch actions')
    )
  }

  // ===============================================================================================

  const leafNodes = [LeafNode1, LeafNode2, LeafNode3]

  const RootNode = () => {
    const [index, setIndex] = React.useState(0)
    const LeafNode = leafNodes[index]
    const dispatch = useDispatch()

    React.useEffect(() => {
      const intervalTimer = setInterval(
        () => {
          dispatch({type: `LeafNode${index + 1}`, payload: index})
        },
        10
      )

      setTimeout(
        () => {
          clearInterval(intervalTimer)

          let newIndex = (index + 1) % leafNodes.length
          setIndex(newIndex)
        },
        100
      )
    }, [index])

    return (
      //<LeafNode />
      React.createElement(LeafNode)
    )
  }

  // ===============================================================================================

  const containerParent = document.getElementById('mocha')
  let container

  beforeEach(() => {
    container = document.createElement('div')
    containerParent.appendChild(container)
  })

  afterEach(() => {
    containerParent.removeChild(container)
    container = null
  })

  // ===============================================================================================

  it('removes React dispatch function when component unmounts (to avoid memory leaks)', (done) => {
    const store = createStore((state, action) => state)

    ReactDOM.render(
      //<StoreContext.Provider value={store}><RootNode /></StoreContext.Provider>,
      React.createElement(StoreContext.Provider, {value: store}, React.createElement(RootNode)),
      container
    )

    const finish = (err) => {
      ReactDOM.render(null, container)
      done(err)
    }

    const run_test = () => {
      let noop = () => {}

      let react_dispatchers_count
      react_dispatchers_count = addDispatch(noop)
      expect(react_dispatchers_count).to.equal(2)
      react_dispatchers_count = removeDispatch(noop)
      expect(react_dispatchers_count).to.equal(1)
    }

    let timeouts_remaining = 200  // (1 second / 10 timeouts)(200 timeouts) = 20 seconds

    const run_timer = () => {
      if (timeouts_remaining <= 0) {
        finish()
        return
      }

      timeouts_remaining--

      setTimeout(() => {
        try {
          run_test()
          run_timer()
        }
        catch(e) {
          finish(e)
        }
      }, 100)
    }

    run_timer()
  }).timeout(21000)

}
