### [unified-redux-react-hook](https://github.com/warren-bank/react-custom-hooks/tree/master/packages/unified-redux-react-hook)

React custom hooks that enhance ['redux-react-hook'](https://github.com/facebookincubator/redux-react-hook) to unify _Redux_ and _React_ `dispatch` methods with a common API.

- - - -

#### <u>CommonJS module</u>

#### Install:

```bash
  npm install --save '@warren-bank/unified-redux-react-hook'
```

#### Usage:

```javascript
  // full list of module exports

  const {StoreContext, addDispatch, removeDispatch, useDispatch, useReduxDispatch, useReduxMappedState, createReduxSelector} = require('@warren-bank/unified-redux-react-hook')
```

```javascript
  // initialize Redux store
  // make context containing Redux store the root component in React hierarchy

  const {createStore}  = require('redux')
  const React          = require('react')
  const ReactDOM       = require('react-dom')
  const {StoreContext} = require('@warren-bank/unified-redux-react-hook')

  const reduxStore = createStore(reduxReducer)

  ReactDOM.render(
    <StoreContext.Provider value={reduxStore}>
      <App />
    </StoreContext.Provider>,
    document.getElementById('root')
  )
```

```javascript
  // add React dispatch method

  const {useReducer}  = require('react')
  const {useDispatch} = require('@warren-bank/unified-redux-react-hook')

  const [reactState, reactDispatcher] = useReducer(reactReducer, reactInitialState)
  const unifiedDispatcher             = useDispatch(reactDispatcher)
```

```javascript
  // use unified dispatch method

  const {useDispatch} = require('@warren-bank/unified-redux-react-hook')

  const unifiedDispatcher = useDispatch()

  const action = {type: 'ADD_TODO', payload: 'buy milk'}
  unifiedDispatcher(action)
```

- - - -

#### <u>Browser bundle</u>

#### Install:

```html
  <!-- dependency: React must be loaded before bundle -->
  <!-- version:    bundle is obtained from npm @ semantic version '1.0.5', which corresponds to git tag 'unified-redux-react-hook/v01.00.05' -->

  <script src="https://unpkg.com/react@16/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/@warren-bank/unified-redux-react-hook@1.0.5/dist/unified-redux-react-hook.min.js"></script>
```

#### Usage:

```javascript
  // full list of module exports

  const {StoreContext, addDispatch, removeDispatch, useDispatch, useReduxDispatch, useReduxMappedState, createReduxSelector} = window.UnifiedReduxReactHook
```

- - - -

#### Notes:

* `useDispatch()`
  - input:
    * optional spread list of React dispatch function(s)
      - this is the preferred way to register React dispatch function(s)
      - it will automatically unregister these function(s) when the component unmounts
  - output:
    * unified `dispatch` function
      - any action passed to this function will be forwarded to:
        * the global Redux store dispatch function
        * __all__ registered React dispatch function(s)

* `addDispatch()`
  - input:
    * exactly one React dispatch function
      - it will __not__ be automatically unregistered, which could lead to memory leaks if you're not careful
      - you are responsible for calling `removeDispatch()` when the component unmounts
  - output:
    * the count of __all__ registered React functions

* `removeDispatch()`
  - input:
    * exactly one React dispatch function, which is equal (by Object comparison) to one that had previously been passed to `addDispatch()`
  - output:
    * the count of __all__ registered React functions

* `useReduxDispatch()`
  - input:
    * none
  - output:
    * Redux dispatch function
  - note:
    * alias for: `require('redux-react-hook').useDispatch`

* `useReduxMappedState()`
  - input:
    * function: `(state) => value`
  - output:
    * `value`
  - note:
    * alias for: `require('redux-react-hook').useMappedState`

* `createReduxSelector()`
  - input:
    * `(...inputSelectors, resultFunc)`
      - `inputSelectors`
        * a list of functions or Array(s) of functions
          - input (to each):
            * the 1st input parameter to each function is the global Redux state
            * subsequent input parameters are copied from the user-supplied input when invoked
          - output (from each):
            * a derived value that is relatively __inexpensive__ to compute
      - `resultFunc`
          - input:
            * the derived values as output from `inputSelectors`
          - output:
            * a derived value that is relatively __expensive__ to compute
  - output:
    * a function
      - when invoked:
        * any parameters passed into this function will also be passed as input parameters to all `inputSelectors` following the Redux state
        * all `inputSelectors` are invoked to obtain the corresponding list of derived values
        * `resultFunc` is invoked
          - note: `resultFunc` is memoized and only executes when its input parameters change
  - references:
    * [Reselect API: `createSelector()` method](https://github.com/reduxjs/reselect#api)
  - notes:
    * `createReduxSelector()` can be called outside of a React component's render function
      - however, the function it creates must only be called inside of a React component's render function
    * though one or more `inputSelectors` should be considered required
      - the fallback behavior when none are provided<br>is to create a function that is roughly equivalent to:<br>`(...ignored) => useReduxMappedState(resultFunc)`

* `StoreContext`
  - type:
    * React context
      - ie: as output by `React.createContext()`
  - note:
    * alias for: `require('redux-react-hook').StoreContext`

- - - -

#### Demos:

1. very basic example
   * design
     * _Redux_ state stores 'todos'
     * _React_ state stores 'theme'
       - the reducer's dispatch is added to the unified dispatcher
       - the unified dispatcher is called by a different component to mutate the state of the component that owns the reducer
   * implementations
     * [Babel standalone](https://warren-bank.github.io/react-custom-hooks/packages/unified-redux-react-hook/demos/01%20-%20demo%20-%20redux%20state%20todos%20-%20react%20state%20theme.html)
     * [Webpack browser-build bundle](https://warren-bank.github.io/react-custom-hooks/packages/unified-redux-react-hook/browser-build/2-demos/01%20-%20demo%20-%20redux%20state%20todos%20-%20react%20state%20theme/dist/index.html)

#### References:

* `npm install `[`'redux-react-hook'`](https://github.com/facebookincubator/redux-react-hook)
  - [issue to pitch the original idea..](https://github.com/facebookincubator/redux-react-hook/issues/78)

#### Docs:

* [Introducing Hooks](https://reactjs.org/docs/hooks-intro.html)
* [Building Your Own Hooks](https://reactjs.org/docs/hooks-custom.html)
* [Hooks API Reference](https://reactjs.org/docs/hooks-reference.html)

#### Video:

* [React Conf 2018: Dan Abramov introduces Hooks](https://youtu.be/dpw9EHDh2bM)

#### Legal:

* copyright: [Warren Bank](https://github.com/warren-bank)
* license: [GPL-2.0](https://www.gnu.org/licenses/old-licenses/gpl-2.0.txt)
