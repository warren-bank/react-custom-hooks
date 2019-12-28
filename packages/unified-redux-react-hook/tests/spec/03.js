/*
 * https://github.com/facebookincubator/redux-react-hook
 */

describe('createReduxSelector(...continued)', () => {
  const expect        = require('expect')
  const compileJSX    = require('compile-jsx')
  const {createStore} = require('redux')
  const React         = require('react')
  const ReactDOM      = require('react-dom')
  const {StoreContext, addDispatch, removeDispatch, useDispatch, useReduxDispatch, useReduxMappedState, createReduxSelector} = require('@warren-bank/unified-redux-react-hook')

  // ===============================================================================================

  const containerParent = document.getElementById('mocha')
  let container, reduxStore

  beforeEach(() => {
    container = document.createElement('div')
    containerParent.appendChild(container)

    const reduxReducer = (state = {}, action) => action.payload || state
    reduxStore = createStore(reduxReducer)
  })

  afterEach(() => {
    ReactDOM.render(
      null,
      container
    )

    containerParent.removeChild(container)
    container = null
  })

  // ===============================================================================================

  it('uses memoization: input-selectors depend on [props, Redux state] and outputs change for every 3x renders', (done) => {
    // https://github.com/facebookincubator/redux-react-hook/issues/80
    // https://codesandbox.io/s/elastic-flower-q88pm

    let selectorExecCount = 0;
    let timer = null;

    const finish = (err) => {
      if (timer)
        clearInterval(timer)
      done(err)
    }

    const selector = createReduxSelector(
      (state, props) => {
        return props.msg || "I did , did I";
      },
      (state, props) => {
        // debounce count: increment once for every 3 ticks
        let count;
        count = state.count || 0;
        count = parseInt(count / 3);
        return count;
      },
      (state, props) => {
        console.log("React props:", props);
        console.log("Redux state:", JSON.stringify(state));
      },
      (msg, count) => {
        selectorExecCount++;
        console.log("msg:", msg);
        console.log("count:", count);

        // reverse string
        let rev_msg = msg
          .split("")
          .reverse()
          .join("");

        return { rev_msg, count };
      },
      { equality: "shallow" }
    );

    const Component = props => {
      const { rev_msg, count } = selector(props);
      console.log("rev_msg:", rev_msg);
      console.log("count:", count);

      const dispatch = useDispatch();

      React.useEffect(() => {
        let new_state = { count: props.renderCount };
        dispatch({ type: "*", payload: new_state });
      }, [dispatch, props.renderCount]);

      try {
        let val1 = parseInt((props.renderCount - 1) / 3)
        let val2 = parseInt(props.renderCount / 3)
        expect([val1, val2]).to.include(count)
        expect (selectorExecCount).to.equal(count + 1)
      }
      catch(err) {
        console.log(err)
        finish(err)
        return null
      }

      if (props.renderCount >= 20) {  // (.25 secs/render)(20 renders) = 5 secs
        finish()
        return null
      }

      return (
        eval(compileJSX(`
          <>
            <h2>{rev_msg}</h2>
            <div className="counters">
              <div>Component render count: {props.renderCount}</div>
              <div>Debounced render count: {count}</div>
              <div>Selector execution count: {selectorExecCount}</div>
            </div>
          </>
        `))
      );
    };

    const App = () => {
      const [renderCount, setRenderCount] = React.useState(1);
      React.useEffect(() => {
        timer = setInterval(() => setRenderCount(renderCount => renderCount + 1), 250);
      }, []);

      return (
        eval(compileJSX(`
          <div className="App">
            <Component msg="hello world!" renderCount={renderCount} />
          </div>
        `))
      );
    };

    ReactDOM.render(
      eval(compileJSX(`
        <StoreContext.Provider value={reduxStore}>
          <App />
        </StoreContext.Provider>
      `)),
      container
    );
  }).timeout(5500)

  // ===============================================================================================
})
