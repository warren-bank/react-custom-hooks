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

  const styles = {
    container: {marginLeft: "45px", marginTop: "15px"},
    table:     {borderStyle: "solid"},
    td2:       {paddingLeft: "1.5em", textAlign: "right"}
  }

  // ===============================================================================================

  const containerParent = document.getElementById('mocha')
  let container, reduxStore

  beforeEach(() => {
    container = document.createElement('div')
    containerParent.appendChild(container)

    if (styles.container) {
      for (let key in styles.container) {
        container.style[key] = styles.container[key]
      }
    }

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
    let actualRenderCount = 0;
    let timer = null;

    const finish = (err) => {
      if (timer)
        clearInterval(timer)
      done(err)
    }

    const selector = createReduxSelector(
      (state, props) => {
        return props.msg || 'I did , did I';
      },
      (state, props) => {
        // debounce count: increment once for every 3 ticks
        let count;
        count = state.count || 0;
        count = parseInt(count / 3);
        return count;
      },
      (state, props) => {
        console.log(('-').repeat(40))
        console.log('React props:', props);
        console.log('Redux state:', JSON.stringify(state));
      },
      (msg, count) => {
        selectorExecCount++;
        console.log('selector() executing:', JSON.stringify({msg, count}));

        // reverse string
        const rev_msg = msg
          .split('')
          .reverse()
          .join('');

        return { rev_msg, count };
      },
      { equality: "shallow" }
    );

    const Component = props => {
      actualRenderCount++

      console.log(('-').repeat(40))
      console.log('React component rendering..')

      const { rev_msg, count } = selector(props);
      console.log('selector().rev_msg:', rev_msg);

      console.log('selector().count:', count)
      console.log('props.renderCount:', props.renderCount)
      console.log('actualRenderCount:', actualRenderCount)

      const dispatch = useDispatch();

      React.useEffect(() => {
        const new_state = { count: props.renderCount };
        dispatch({ type: "*", payload: new_state });
      }, [dispatch, props.renderCount]);

      try {
        const val1 = parseInt((props.renderCount - 1) / 3)
        const val2 = parseInt(props.renderCount / 3)
        expect([val1, val2]).to.include(count)
        expect (selectorExecCount).to.equal(count + 1)
        expect (actualRenderCount).to.equal(props.renderCount + count)
      }
      catch(err) {
        console.log(('-').repeat(40))
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
          <table style={styles.table}>
            <tr>
              <td>Component render count:</td>
              <td style={styles.td2}>{actualRenderCount}</td>
            </tr>
            <tr>
              <td><li>Renders due to updated React props:</li></td>
              <td style={styles.td2}>{props.renderCount}</td>
            </tr>
            <tr>
              <td><li>Renders due to updated Redux selector:</li></td>
              <td style={styles.td2}>{count}</td>
            </tr>
            <tr>
              <td>Debounced render count:</td>
              <td style={styles.td2}>{count}</td>
            </tr>
            <tr>
              <td>Selector execution count:</td>
              <td style={styles.td2}>{selectorExecCount}</td>
            </tr>
          </table>
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

  it('uses memoization: same as previous test w/ performance optimizations', (done) => {
    // https://github.com/facebookincubator/redux-react-hook/issues/80
    // https://codesandbox.io/s/elastic-flower-q88pm

    let selectorExecCount = 0;
    let actualRenderCount = 0;
    let timer = null;

    const finish = (err) => {
      if (timer)
        clearInterval(timer)
      done(err)
    }

    const selector = createReduxSelector(
      (state, props) => {
        return props.msg || 'I did , did I';
      },
      (state, props) => {
        // debounce count: increment once for every 3 ticks
        let count;
        count = state.count || 0;
        count = parseInt(count / 3);
        return count;
      },
      (state, props) => {
        console.log(('-').repeat(40))
        console.log('React props:', props);
        console.log('Redux state:', JSON.stringify(state));
      },
      (msg, count) => {
        selectorExecCount++;
        console.log('selector() executing:', JSON.stringify({msg, count}));

        // reverse string
        const rev_msg = msg
          .split('')
          .reverse()
          .join('');

        return { rev_msg, count };
      },
      { equality: "shallow" }
    );

    const Component = React.memo(props => {
      actualRenderCount++

      const renderCount = useReduxMappedState(
        state => state.count || 1,

        // trick: never force a render update by using an equality method that always returns `true` (ie: no change)
        () => true
      )

      console.log(('-').repeat(40))
      console.log('React component rendering..')

      const { rev_msg, count } = selector(props);
      console.log('selector().rev_msg:', rev_msg);

      console.log('selector().count:', count)
      console.log('parent.renderCount:', renderCount)
      console.log('actualRenderCount:', actualRenderCount)

      try {
        const val1 = parseInt((renderCount - 1) / 3)
        const val2 = parseInt(renderCount / 3)
        expect([val1, val2]).to.include(count)
        expect (selectorExecCount).to.equal(count + 1)
        expect (actualRenderCount).to.equal(selectorExecCount)
      }
      catch(err) {
        console.log(('-').repeat(40))
        console.log(err)
        finish(err)
        return null
      }

      if (renderCount >= 20) {  // (.25 secs/render)(20 renders) = 5 secs
        finish()
        return null
      }

      return (
        eval(compileJSX(`
          <table style={styles.table}>
            <tr>
              <td>Component render count:</td>
              <td style={styles.td2}>{actualRenderCount}</td>
            </tr>
            <tr>
              <td><li>Renders due to updated React props:</li></td>
              <td style={styles.td2}>1</td>
            </tr>
            <tr>
              <td><li>Renders due to updated Redux selector:</li></td>
              <td style={styles.td2}>{count}</td>
            </tr>
            <tr>
              <td>Debounced render count:</td>
              <td style={styles.td2}>{count}</td>
            </tr>
            <tr>
              <td>Selector execution count:</td>
              <td style={styles.td2}>{selectorExecCount}</td>
            </tr>
          </table>
        `))
      );
    });

    const App = () => {
      const [renderCount, setRenderCount] = React.useState(1);
      React.useEffect(() => {
        timer = setInterval(() => setRenderCount(renderCount => renderCount + 1), 250);
      }, []);

      const dispatch = useDispatch();
      React.useEffect(() => {
        const new_state = { count: renderCount };
        dispatch({ type: "*", payload: new_state });
      }, [dispatch, renderCount]);

      return (
        eval(compileJSX(`
          <div className="App">
            <Component msg="hello world!" />
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
