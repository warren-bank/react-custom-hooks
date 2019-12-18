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
  <!-- version:    bundle is obtained from npm @ semantic version '1.0.11', which corresponds to git tag 'unified-redux-react-hook/v01.00.11' -->

  <script src="https://unpkg.com/react@16/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/@warren-bank/unified-redux-react-hook@1.0.11/dist/unified-redux-react-hook.min.js"></script>
```

#### Usage:

```javascript
  // full list of module exports

  const {StoreContext, addDispatch, removeDispatch, useDispatch, useReduxDispatch, useReduxMappedState, createReduxSelector} = window.UnifiedReduxReactHook
```

- - - -

#### API:

* `useDispatch()`<a name="api-use-dispatch"/>
  - input:
    * optional spread list of React dispatch function(s)
      - this is the preferred way to register React dispatch function(s)
      - it will automatically unregister these function(s) when the component unmounts
  - output:
    * unified `dispatch` function
      - any action passed to this function will be forwarded to:
        * the global Redux store dispatch function
        * __all__ registered React dispatch function(s)

* `addDispatch()`<a name="api-add-dispatch"/>
  - input:
    * exactly one React dispatch function
      - it will __not__ be automatically unregistered, which could lead to memory leaks if you're not careful
      - you are responsible for calling `removeDispatch()` when the component unmounts
  - output:
    * the count of __all__ registered React functions

* `removeDispatch()`<a name="api-remove-dispatch"/>
  - input:
    * exactly one React dispatch function, which is equal (by `===` reference equality) to one that had previously been passed to `addDispatch()`
  - output:
    * the count of __all__ registered React functions

* `useReduxDispatch()`<a name="api-use-redux-dispatch"/>
  - input:
    * none
  - output:
    * Redux dispatch function
  - note:
    * alias for: `require('redux-react-hook').useDispatch`

* `useReduxMappedState()`<a name="api-use-redux-mapped-state"/>
  - input:
    * function: `(state) => value`
  - output:
    * `value`
  - note:
    * alias for: `require('redux-react-hook').useMappedState`

* `createReduxSelector()`<a name="api-create-redux-selector"/>
  - input:
    * `(...inputSelectors, resultFunc, options)`
      - `inputSelectors`
        * [required] a list of functions or Array(s) of functions
          - input (to each):
            * the 1st input parameter to each function is the global Redux state
            * subsequent input parameters are copied from the user-supplied input when invoked
          - output (from each):
            * a derived value that is relatively __inexpensive__ to compute
      - `resultFunc`
        * [required] a function
          - input:
            * the derived values as output from `inputSelectors`
          - output:
            * a derived value that is relatively __expensive__ to compute
      - `options`
        * [optional] an Object
          1. key: `equality`
             * type: Object || String || Number || null
               - Object:
                 1. shape:
                    ```javascript
                      {
                        equality: {
                          forceUpdate: [],
                          recalculate: ''
                        }
                      }
                    ```
                 2. key: `forceUpdate`
                    - an Array of: String || Integer || null
                      * length of Array should match the number of `inputSelectors`
                        - each value in the Array corresponds to one `inputSelector`
                      * all `inputSelectors` execute every time the global Redux state changes
                      * the previous result of each `inputSelector` is compared to the new result
                      * if the values are determined to be different, then the React component will re-render
                      * the purpose of this value is to configure how equality is determined
                        1. `null` represents the default behavior, which is to compare values by strict reference equality (`===`)
                        2. valid String values include: `'deep'` and `'shallow'`
                           * see: [efficiency considerations](#user-content-api-create-redux-selector-efficiency-considerations)
                        3. an Integer value results in a `'shallow'` comparison that is allowed to recurse up to the specified maximum depth
                    - shortcut: String || Integer || null
                      * this value is applied to all `inputSelectors`
                    - default value: null
                 3. key: `recalculate`
                    - String || Integer || null
                      * the results of all `inputSelectors` are determined every time the React component renders
                        - note: `inputSelectors` are memoized and only execute when either the global Redux state changes, or the value of any input parameter changes
                      * the previous results are compared to the new results
                      * if the values are determined to be different, then `resultFunc` will execute
                        - otherwise, the memoized result is reused
                      * the purpose of this value is to configure how equality is determined
                        1. `null` represents the default behavior, which is to compare values by strict reference equality (`===`)
                        2. valid String values include: `'deep'` and `'shallow'`
                           * see: [efficiency considerations](#user-content-api-create-redux-selector-efficiency-considerations)
                        3. an Integer value results in a `'shallow'` comparison that is allowed to recurse up to the specified maximum depth
                    - default value: null
               - String || Number || null:
                 * shortcut:
                   - this value is applied to `forceUpdate` and `recalculate`
  - output:
    * a function
      - when invoked:
        * any parameters passed into this function will also be passed as input parameters to all `inputSelectors` following the Redux state
        * all `inputSelectors` are invoked to obtain the corresponding list of derived values
          - note: `inputSelectors` are memoized and only execute when either the global Redux state changes, or the value of any input parameter changes
        * `resultFunc` is invoked
          - note: `resultFunc` is memoized and only executes when its input parameters change
  - references:
    * [Reselect API: `createSelector()` method](https://github.com/reduxjs/reselect#api)
  - notes:
    * `createReduxSelector()` can be called outside of a React component's render function
      - however, the function it creates must only be called inside of a React component's render function
    * same as the default behavior for `require('reselect').createSelector`
      - reference equality (`===`) is the default behavior used to determine if the value returned by an input-selector has changed between calls
    * though one or more `inputSelectors` should be considered required
      - the fallback behavior when none are provided<br>is to create a function that is roughly equivalent to:<br>`(...ignored) => useReduxMappedState(resultFunc)`
  - efficiency considerations:<a name="api-create-redux-selector-efficiency-considerations"/>
    * on 1st render of React component:
      - all `inputSelectors` execute
      - `resultFunc` executes
    * on subsequent renders of React component:
      - all `inputSelectors` are memoized
        * cache of each corresponding result value is invalidated under any of the following circumstances:
          - global Redux `state` is changed
          - one or more values in the list of input parameters is changed
      - `resultFunc` is memoized
        * cache of the result value is invalidated when:
          - one or more values in the list of input parameters is changed
            * this list of input parameters is the ordered list of output values as produced by the `inputSelectors`
            * how _change_ is determined can be configured in _options_
              * by default, equality is determined by reference
              * when `options.equality.recalculate === 'shallow'`, equality is also determined by reference.. such that:
                - top-level Objects and Arrays do not need to be equal by reference
                - top-level Objects and Arrays must contain children that are __all__ equal by reference
              * when `options.equality.recalculate === 'deep'`, equality is determined.. such that:
                - Objects and Arrays at any depth within the data structure do not need to be equal by reference
                - Objects and Arrays at any depth within the data structure must contain children that are either:
                  * an Object or Array
                  * a data type that can be converted to a primitive value and compared for equality
  - examples:
    * [unit tests](https://github.com/warren-bank/react-custom-hooks/blob/master/packages/unified-redux-react-hook/tests/spec/02.js#L73)

* `StoreContext`<a name="api-store-context"/>
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

#### Tests:

1. [unit tests](https://warren-bank.github.io/react-custom-hooks/packages/unified-redux-react-hook/tests/mocha.html) that run in [Browser Mocha](https://mochajs.org/#running-mocha-in-the-browser)

- - - -

#### References:

* `npm install `[`'redux-react-hook'`](https://github.com/facebookincubator/redux-react-hook)
  - [issue to pitch the original idea..](https://github.com/facebookincubator/redux-react-hook/issues/78)

#### Docs:

* [Introducing Hooks](https://reactjs.org/docs/hooks-intro.html)
* [Building Your Own Hooks](https://reactjs.org/docs/hooks-custom.html)
* [Hooks API Reference](https://reactjs.org/docs/hooks-reference.html)

#### Video:

* [React Conf 2018: Dan Abramov introduces Hooks](https://youtu.be/dpw9EHDh2bM)

- - - -

#### Legal:

* copyright: [Warren Bank](https://github.com/warren-bank)
* license: [GPL-2.0](https://www.gnu.org/licenses/old-licenses/gpl-2.0.txt)
