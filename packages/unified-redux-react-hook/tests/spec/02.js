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

  const containerParent = document.getElementById('mocha')
  let container, reduxStore

  beforeEach(() => {
    container = document.createElement('div')
    containerParent.appendChild(container)

    const reduxReducer = (state = {}, action) => {
      if (action.type === 'nonce') {
        let new_val = (action.payload) ? action.payload    :
                      (state.nonce)    ? (state.nonce + 1) :
                      1

        return {...state, nonce: new_val}
      }
      else {
        return action.payload
      }
    }
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

  const render = (Component) => {
    ReactDOM.render(
      //<StoreContext.Provider value={reduxStore}><Component /></StoreContext.Provider>,
      React.createElement(StoreContext.Provider, {value: reduxStore}, React.createElement(Component)),
      container
    )
  }

  // ===============================================================================================

  it('handles Redux selectors ⇒ reselect example #01 w/ call signature: (...inputSelectors, resultFunc)', (done) => {
    // https://github.com/reduxjs/reselect#reselect

    // initialize Redux state
    const exampleState = {
      shop: {
        taxPercent: 8,
        items: [
          { name: 'apple',  value: 1.20 },
          { name: 'orange', value: 0.95 },
        ]
      }
    }
    reduxStore.dispatch({type: '*', payload: exampleState})

    const shopItemsSelector  = state => state.shop.items
    const taxPercentSelector = state => state.shop.taxPercent

    const subtotalSelector = createReduxSelector(
      shopItemsSelector,
      (items) => {
        const result = items.reduce((acc, item) => acc + item.value, 0)
        return result
      }
    )

    const taxSelector = createReduxSelector(
      subtotalSelector,
      taxPercentSelector,
      (subtotal, taxPercent) => {
        const result = subtotal * (taxPercent / 100)
        return result
      }
    )

    const totalSelector = createReduxSelector(
      subtotalSelector,
      taxSelector,
      (subtotal, tax) => {
        const result = { total: subtotal + tax }
        return result
      }
    )

    const Component = () => {
      try {
        expect(subtotalSelector()).to.equal(2.15)
        expect(taxSelector()).to.equal(0.172)
        expect(totalSelector()).to.deep.equal({total: 2.322})
        done()
      }
      catch (err) {
        done(err)
      }

      return React.createElement('div')
    }

    render(Component)
  })

  // ===============================================================================================

  it('handles Redux selectors ⇒ reselect example #01 w/ call signature: ([inputSelectors], resultFunc)', (done) => {
    // https://github.com/reduxjs/reselect#reselect

    // initialize Redux state
    const exampleState = {
      shop: {
        taxPercent: 8,
        items: [
          { name: 'apple',  value: 1.20 },
          { name: 'orange', value: 0.95 },
        ]
      }
    }
    reduxStore.dispatch({type: '*', payload: exampleState})

    const shopItemsSelector  = state => state.shop.items
    const taxPercentSelector = state => state.shop.taxPercent

    const subtotalSelector = createReduxSelector(
      [shopItemsSelector],
      (items) => {
        const result = items.reduce((acc, item) => acc + item.value, 0)
        return result
      }
    )

    const taxSelector = createReduxSelector(
      [subtotalSelector, taxPercentSelector],
      (subtotal, taxPercent) => {
        const result = subtotal * (taxPercent / 100)
        return result
      }
    )

    const totalSelector = createReduxSelector(
      [subtotalSelector],
      taxSelector,
      (subtotal, tax) => {
        const result = { total: subtotal + tax }
        return result
      }
    )

    const Component = () => {
      try {
        expect(subtotalSelector()).to.equal(2.15)
        expect(taxSelector()).to.equal(0.172)
        expect(totalSelector()).to.deep.equal({total: 2.322})
        done()
      }
      catch (err) {
        done(err)
      }

      return React.createElement('div')
    }

    render(Component)
  })

  // ===============================================================================================

  it('memoizes Redux selectors  ⇒ without parameters, Redux state is unmodified', (done) => {
    // https://github.com/reduxjs/reselect#reselect

    // initialize Redux state
    const exampleState = {
      shop: {
        taxPercent: 8,
        items: [
          { name: 'apple',  value: 1.20 },
          { name: 'orange', value: 0.95 },
        ]
      }
    }
    reduxStore.dispatch({type: '*', payload: exampleState})

    const callCounter = {shopItems: 0, taxPercent: 0, subtotal: 0, tax: 0, total: 0}

    const shopItemsSelector  = (state) => {callCounter.shopItems++;  return state.shop.items}
    const taxPercentSelector = (state) => {callCounter.taxPercent++; return state.shop.taxPercent}

    const subtotalSelector = createReduxSelector(
      shopItemsSelector,
      (items) => {
        callCounter.subtotal++
        const result = items.reduce((acc, item) => acc + item.value, 0)
        return result
      }
    )

    const taxSelector = createReduxSelector(
      [subtotalSelector, taxPercentSelector],
      (subtotal, taxPercent) => {
        callCounter.tax++
        const result = subtotal * (taxPercent / 100)
        return result
      }
    )

    const totalSelector = createReduxSelector(
      [subtotalSelector, taxSelector],
      (subtotal, tax) => {
        callCounter.total++
        const result = { total: subtotal + tax }
        return result
      }
    )

    const Component = () => {
      const [renderCounter, setRenderCounter] = React.useState(1)

      React.useEffect(() => {
        if (renderCounter < 3) {
          setTimeout(
            () => setRenderCounter(renderCounter + 1),
            10
          )
        }
      })

      try {
        switch(renderCounter) {

          case 1:
            expect(callCounter).to.deep.equal({shopItems: 0, taxPercent: 0, subtotal: 0, tax: 0, total: 0})

            expect(subtotalSelector()).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: (0+1), taxPercent: 0, subtotal: (0+1), tax: 0, total: 0})

            expect(subtotalSelector()).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: (1+1), taxPercent: 0, subtotal: (1+1), tax: 0, total: 0})

            expect(taxSelector()).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: (2+1), taxPercent: (0+1), subtotal: (2+1), tax: (0+1), total: 0})

            expect(taxSelector()).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: (3+1), taxPercent: (1+1), subtotal: (3+1), tax: (1+1), total: 0})

            expect(totalSelector()).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: (4+2), taxPercent: (2+1), subtotal: (4+2), tax: (2+1), total: (0+1)})

            expect(totalSelector()).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: (6+2), taxPercent: (3+1), subtotal: (6+2), tax: (3+1), total: (1+1)})

            break

          case 2:
            expect(callCounter).to.deep.equal({shopItems: 8, taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are NOT called because Redux state is unchanged, 'resultFunc' is NOT called because derived values are unchanged (reference equality)
            expect(subtotalSelector()).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: 8, taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are NOT called because Redux state is unchanged, 'resultFunc' is NOT called because derived values are unchanged (reference equality)
            expect(subtotalSelector()).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: 8, taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are NOT called because Redux state is unchanged, 'resultFunc' is NOT called because derived values are unchanged (reference equality)
            expect(taxSelector()).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: 8, taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are NOT called because Redux state is unchanged, 'resultFunc' is NOT called because derived values are unchanged (reference equality)
            expect(taxSelector()).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: 8, taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are NOT called because Redux state is unchanged, 'resultFunc' is NOT called because derived values are unchanged (reference equality)
            expect(totalSelector()).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: 8, taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are NOT called because Redux state is unchanged, 'resultFunc' is NOT called because derived values are unchanged (reference equality)
            expect(totalSelector()).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: 8, taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            break

          case 3:
            expect(callCounter).to.deep.equal({shopItems: 8, taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are NOT called because Redux state is unchanged, 'resultFunc' is NOT called because derived values are unchanged (reference equality)
            expect(subtotalSelector()).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: 8, taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are NOT called because Redux state is unchanged, 'resultFunc' is NOT called because derived values are unchanged (reference equality)
            expect(subtotalSelector()).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: 8, taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are NOT called because Redux state is unchanged, 'resultFunc' is NOT called because derived values are unchanged (reference equality)
            expect(taxSelector()).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: 8, taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are NOT called because Redux state is unchanged, 'resultFunc' is NOT called because derived values are unchanged (reference equality)
            expect(taxSelector()).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: 8, taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are NOT called because Redux state is unchanged, 'resultFunc' is NOT called because derived values are unchanged (reference equality)
            expect(totalSelector()).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: 8, taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are NOT called because Redux state is unchanged, 'resultFunc' is NOT called because derived values are unchanged (reference equality)
            expect(totalSelector()).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: 8, taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            done()
            break
        }
      }
      catch (err) {
        console.log(err)
        done(err)
      }

      return React.createElement('div', null, 'Render count: ' + JSON.stringify(renderCounter))
    }

    render(Component)
  })

  // ===============================================================================================

  it('memoizes Redux selectors  ⇒ without parameters, Redux state is modified', (done) => {
    // https://github.com/reduxjs/reselect#reselect

    // initialize Redux state
    const exampleState = {
      shop: {
        taxPercent: 8,
        items: [
          { name: 'apple',  value: 1.20 },
          { name: 'orange', value: 0.95 },
        ]
      }
    }
    reduxStore.dispatch({type: '*', payload: exampleState})

    const callCounter = {shopItems: 0, taxPercent: 0, subtotal: 0, tax: 0, total: 0}

    const shopItemsSelector  = (state) => {callCounter.shopItems++;  return state.shop.items}
    const taxPercentSelector = (state) => {callCounter.taxPercent++; return state.shop.taxPercent}

    const subtotalSelector = createReduxSelector(
      shopItemsSelector,
      (items) => {
        callCounter.subtotal++
        const result = items.reduce((acc, item) => acc + item.value, 0)
        return result
      }
    )

    const taxSelector = createReduxSelector(
      [subtotalSelector, taxPercentSelector],
      (subtotal, taxPercent) => {
        callCounter.tax++
        const result = subtotal * (taxPercent / 100)
        return result
      }
    )

    const totalSelector = createReduxSelector(
      [subtotalSelector, taxSelector],
      (subtotal, tax) => {
        callCounter.total++
        const result = { total: subtotal + tax }
        return result
      }
    )

    const mapState = (state) => state.nonce || 1

    const Component = () => {
      const renderCounter = useReduxMappedState(mapState)

      React.useEffect(() => {
        if (renderCounter < 3) {
          setTimeout(
            () => reduxStore.dispatch({type: 'nonce', payload: (renderCounter + 1)}),
            10
          )
        }
      })

      try {
        switch(renderCounter) {

          case 1:
            expect(callCounter).to.deep.equal({shopItems: 0, taxPercent: 0, subtotal: 0, tax: 0, total: 0})

            expect(subtotalSelector()).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: (0+1), taxPercent: 0, subtotal: (0+1), tax: 0, total: 0})

            expect(subtotalSelector()).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: (1+1), taxPercent: 0, subtotal: (1+1), tax: 0, total: 0})

            expect(taxSelector()).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: (2+1), taxPercent: (0+1), subtotal: (2+1), tax: (0+1), total: 0})

            expect(taxSelector()).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: (3+1), taxPercent: (1+1), subtotal: (3+1), tax: (1+1), total: 0})

            expect(totalSelector()).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: (4+2), taxPercent: (2+1), subtotal: (4+2), tax: (2+1), total: (0+1)})

            expect(totalSelector()).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: (6+2), taxPercent: (3+1), subtotal: (6+2), tax: (3+1), total: (1+1)})

            break

          case 2:
            expect(callCounter).to.deep.equal({shopItems: 8, taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because Redux state has changed, 'resultFunc' is NOT called because derived values are unchanged (reference equality)
            expect(subtotalSelector()).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: (8+1), taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because Redux state has changed, 'resultFunc' is NOT called because derived values are unchanged (reference equality)
            expect(subtotalSelector()).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: (9+1), taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because Redux state has changed, 'resultFunc' is NOT called because derived values are unchanged (reference equality)
            expect(taxSelector()).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: (10+1), taxPercent: (4+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because Redux state has changed, 'resultFunc' is NOT called because derived values are unchanged (reference equality)
            expect(taxSelector()).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: (11+1), taxPercent: (5+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because Redux state has changed, 'resultFunc' is NOT called because derived values are unchanged (reference equality)
            expect(totalSelector()).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: (12+2), taxPercent: (6+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because Redux state has changed, 'resultFunc' is NOT called because derived values are unchanged (reference equality)
            expect(totalSelector()).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: (14+2), taxPercent: (7+1), subtotal: 8, tax: 4, total: 2})

            break

          case 3:
            expect(callCounter).to.deep.equal({shopItems: 16, taxPercent: 8, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because Redux state has changed, 'resultFunc' is NOT called because derived values are unchanged (reference equality)
            expect(subtotalSelector()).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: (16+1), taxPercent: 8, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because Redux state has changed, 'resultFunc' is NOT called because derived values are unchanged (reference equality)
            expect(subtotalSelector()).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: (17+1), taxPercent: 8, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because Redux state has changed, 'resultFunc' is NOT called because derived values are unchanged (reference equality)
            expect(taxSelector()).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: (18+1), taxPercent: (8+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because Redux state has changed, 'resultFunc' is NOT called because derived values are unchanged (reference equality)
            expect(taxSelector()).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: (19+1), taxPercent: (9+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because Redux state has changed, 'resultFunc' is NOT called because derived values are unchanged (reference equality)
            expect(totalSelector()).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: (20+2), taxPercent: (10+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because Redux state has changed, 'resultFunc' is NOT called because derived values are unchanged (reference equality)
            expect(totalSelector()).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: (22+2), taxPercent: (11+1), subtotal: 8, tax: 4, total: 2})

            done()
            break
        }
      }
      catch (err) {
        console.log(err)
        done(err)
      }

      return React.createElement('div', null, 'Render count: ' + JSON.stringify(renderCounter))
    }

    render(Component)
  })

  // ===============================================================================================

  it('memoizes Redux selectors  ⇒ with parameters, , Redux state is unmodified', (done) => {
    // https://github.com/reduxjs/reselect#reselect

    // initialize Redux state
    const exampleState = {
      shop: {
        taxPercent: 8,
        items: [
          { name: 'apple',  value: 1.20 },
          { name: 'orange', value: 0.95 },
        ]
      }
    }
    reduxStore.dispatch({type: '*', payload: exampleState})

    const callCounter = {shopItems: 0, taxPercent: 0, subtotal: 0, tax: 0, total: 0}

    const shopItemsSelector  = (state, ...params) => {console.log('"shopItemsSelector" params:',  ...params); callCounter.shopItems++;  return state.shop.items}
    const taxPercentSelector = (state, ...params) => {console.log('"taxPercentSelector" params:', ...params); callCounter.taxPercent++; return state.shop.taxPercent}

    const subtotalSelector = createReduxSelector(
      shopItemsSelector,
      (items) => {
        callCounter.subtotal++
        const result = items.reduce((acc, item) => acc + item.value, 0)
        return result
      }
    )

    const taxSelector = createReduxSelector(
      [subtotalSelector, taxPercentSelector],
      (subtotal, taxPercent) => {
        callCounter.tax++
        const result = subtotal * (taxPercent / 100)
        return result
      }
    )

    const totalSelector = createReduxSelector(
      [subtotalSelector, taxSelector],
      (subtotal, tax) => {
        callCounter.total++
        const result = { total: subtotal + tax }
        return result
      }
    )

    const Component = () => {
      const [renderCounter, setRenderCounter] = React.useState(1)

      React.useEffect(() => {
        if (renderCounter < 3) {
          setTimeout(
            () => setRenderCounter(renderCounter + 1),
            10
          )
        }
      })

      try {
        switch(renderCounter) {

          case 1:
            expect(callCounter).to.deep.equal({shopItems: 0, taxPercent: 0, subtotal: 0, tax: 0, total: 0})

            expect(subtotalSelector(renderCounter)).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: (0+1), taxPercent: 0, subtotal: (0+1), tax: 0, total: 0})

            expect(subtotalSelector(renderCounter)).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: (1+1), taxPercent: 0, subtotal: (1+1), tax: 0, total: 0})

            expect(taxSelector(renderCounter)).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: (2+1), taxPercent: (0+1), subtotal: (2+1), tax: (0+1), total: 0})

            expect(taxSelector(renderCounter)).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: (3+1), taxPercent: (1+1), subtotal: (3+1), tax: (1+1), total: 0})

            expect(totalSelector(renderCounter)).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: (4+2), taxPercent: (2+1), subtotal: (4+2), tax: (2+1), total: (0+1)})

            expect(totalSelector(renderCounter)).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: (6+2), taxPercent: (3+1), subtotal: (6+2), tax: (3+1), total: (1+1)})

            break

          case 2:
            expect(callCounter).to.deep.equal({shopItems: 8, taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged (reference equality)
            expect(subtotalSelector(renderCounter)).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: (8+1), taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged (reference equality)
            expect(subtotalSelector(renderCounter)).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: (9+1), taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged (reference equality)
            expect(taxSelector(renderCounter)).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: (10+1), taxPercent: (4+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged (reference equality)
            expect(taxSelector(renderCounter)).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: (11+1), taxPercent: (5+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged (reference equality)
            expect(totalSelector(renderCounter)).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: (12+2), taxPercent: (6+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged (reference equality)
            expect(totalSelector(renderCounter)).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: (14+2), taxPercent: (7+1), subtotal: 8, tax: 4, total: 2})

            break

          case 3:
            expect(callCounter).to.deep.equal({shopItems: 16, taxPercent: 8, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged (reference equality)
            expect(subtotalSelector(renderCounter)).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: (16+1), taxPercent: 8, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged (reference equality)
            expect(subtotalSelector(renderCounter)).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: (17+1), taxPercent: 8, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged (reference equality)
            expect(taxSelector(renderCounter)).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: (18+1), taxPercent: (8+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged (reference equality)
            expect(taxSelector(renderCounter)).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: (19+1), taxPercent: (9+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged (reference equality)
            expect(totalSelector(renderCounter)).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: (20+2), taxPercent: (10+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged (reference equality)
            expect(totalSelector(renderCounter)).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: (22+2), taxPercent: (11+1), subtotal: 8, tax: 4, total: 2})

            done()
            break
        }
      }
      catch (err) {
        console.log(err)
        done(err)
      }

      return React.createElement('div', null, 'Render count: ' + JSON.stringify(renderCounter))
    }

    render(Component)
  })

  // ===============================================================================================

  it('memoizes Redux selectors  ⇒ using option: shallow equality', (done) => {
    // https://github.com/reduxjs/reselect#reselect

    // initialize Redux state
    const exampleState = {
      shop: {
        taxPercent: 8,
        items: [
          { name: 'apple',  value: 1.20 },
          { name: 'orange', value: 0.95 },
        ]
      }
    }
    reduxStore.dispatch({type: '*', payload: exampleState})

    const callCounter = {shopItems: 0, taxPercent: 0, subtotal: 0, tax: 0, total: 0}

    const shopItemsSelector  = (state) => {callCounter.shopItems++;  return [...state.shop.items]}
    const taxPercentSelector = (state) => {callCounter.taxPercent++; return state.shop.taxPercent}

    const subtotalSelector = createReduxSelector(
      shopItemsSelector,
      (items) => {
        callCounter.subtotal++
        const result = items.reduce((acc, item) => acc + item.value, 0)
        return result
      },
      {equality: 'shallow'}
    )

    const taxSelector = createReduxSelector(
      [subtotalSelector, taxPercentSelector],
      (subtotal, taxPercent) => {
        callCounter.tax++
        const result = subtotal * (taxPercent / 100)
        return result
      },
      {equality: 'shallow'}
    )

    const totalSelector = createReduxSelector(
      [subtotalSelector, taxSelector],
      (subtotal, tax) => {
        callCounter.total++
        const result = { total: subtotal + tax }
        return result
      },
      {equality: 'shallow'}
    )

    const Component = () => {
      const [renderCounter, setRenderCounter] = React.useState(1)

      React.useEffect(() => {
        if (renderCounter < 3) {
          setTimeout(
            () => setRenderCounter(renderCounter + 1),
            10
          )
        }
      })

      try {
        switch(renderCounter) {

          case 1:
            expect(callCounter).to.deep.equal({shopItems: 0, taxPercent: 0, subtotal: 0, tax: 0, total: 0})

            expect(subtotalSelector(renderCounter)).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: (0+1), taxPercent: 0, subtotal: (0+1), tax: 0, total: 0})

            expect(subtotalSelector(renderCounter)).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: (1+1), taxPercent: 0, subtotal: (1+1), tax: 0, total: 0})

            expect(taxSelector(renderCounter)).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: (2+1), taxPercent: (0+1), subtotal: (2+1), tax: (0+1), total: 0})

            expect(taxSelector(renderCounter)).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: (3+1), taxPercent: (1+1), subtotal: (3+1), tax: (1+1), total: 0})

            expect(totalSelector(renderCounter)).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: (4+2), taxPercent: (2+1), subtotal: (4+2), tax: (2+1), total: (0+1)})

            expect(totalSelector(renderCounter)).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: (6+2), taxPercent: (3+1), subtotal: (6+2), tax: (3+1), total: (1+1)})

            break

          case 2:
            expect(callCounter).to.deep.equal({shopItems: 8, taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged (shallow equality)
            expect(subtotalSelector(renderCounter)).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: (8+1), taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged (shallow equality)
            expect(subtotalSelector(renderCounter)).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: (9+1), taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged (shallow equality)
            expect(taxSelector(renderCounter)).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: (10+1), taxPercent: (4+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged (shallow equality)
            expect(taxSelector(renderCounter)).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: (11+1), taxPercent: (5+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged (shallow equality)
            expect(totalSelector(renderCounter)).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: (12+2), taxPercent: (6+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged (shallow equality)
            expect(totalSelector(renderCounter)).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: (14+2), taxPercent: (7+1), subtotal: 8, tax: 4, total: 2})

            break

          case 3:
            expect(callCounter).to.deep.equal({shopItems: 16, taxPercent: 8, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged (shallow equality)
            expect(subtotalSelector(renderCounter)).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: (16+1), taxPercent: 8, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged (shallow equality)
            expect(subtotalSelector(renderCounter)).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: (17+1), taxPercent: 8, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged (shallow equality)
            expect(taxSelector(renderCounter)).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: (18+1), taxPercent: (8+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged (shallow equality)
            expect(taxSelector(renderCounter)).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: (19+1), taxPercent: (9+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged (shallow equality)
            expect(totalSelector(renderCounter)).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: (20+2), taxPercent: (10+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged (shallow equality)
            expect(totalSelector(renderCounter)).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: (22+2), taxPercent: (11+1), subtotal: 8, tax: 4, total: 2})

            done()
            break
        }
      }
      catch (err) {
        console.log(err)
        done(err)
      }

      return React.createElement('div', null, 'Render count: ' + JSON.stringify(renderCounter))
    }

    render(Component)
  })

  // ===============================================================================================

  it('memoizes Redux selectors  ⇒ using option: deep equality', (done) => {
    // https://github.com/reduxjs/reselect#reselect

    // initialize Redux state
    const exampleState = {
      shop: {
        taxPercent: 8,
        items: [
          { name: 'apple',  value: 1.20 },
          { name: 'orange', value: 0.95 },
        ]
      }
    }
    reduxStore.dispatch({type: '*', payload: exampleState})

    const callCounter = {shopItems: 0, taxPercent: 0, subtotal: 0, tax: 0, total: 0}

    const shopItemsSelector  = (state) => {callCounter.shopItems++;  return state.shop.items.map(item => ({...item}))}
    const taxPercentSelector = (state) => {callCounter.taxPercent++; return state.shop.taxPercent}

    const subtotalSelector = createReduxSelector(
      shopItemsSelector,
      (items) => {
        callCounter.subtotal++
        const result = items.reduce((acc, item) => acc + item.value, 0)
        return result
      },
      {equality: 'deep'}
    )

    const taxSelector = createReduxSelector(
      [subtotalSelector, taxPercentSelector],
      (subtotal, taxPercent) => {
        callCounter.tax++
        const result = subtotal * (taxPercent / 100)
        return result
      },
      {equality: 'deep'}
    )

    const totalSelector = createReduxSelector(
      [subtotalSelector, taxSelector],
      (subtotal, tax) => {
        callCounter.total++
        const result = { total: subtotal + tax }
        return result
      },
      {equality: 'deep'}
    )

    const Component = () => {
      const [renderCounter, setRenderCounter] = React.useState(1)

      React.useEffect(() => {
        if (renderCounter < 3) {
          setTimeout(
            () => setRenderCounter(renderCounter + 1),
            10
          )
        }
      })

      try {
        switch(renderCounter) {

          case 1:
            expect(callCounter).to.deep.equal({shopItems: 0, taxPercent: 0, subtotal: 0, tax: 0, total: 0})

            expect(subtotalSelector(renderCounter)).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: (0+1), taxPercent: 0, subtotal: (0+1), tax: 0, total: 0})

            expect(subtotalSelector(renderCounter)).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: (1+1), taxPercent: 0, subtotal: (1+1), tax: 0, total: 0})

            expect(taxSelector(renderCounter)).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: (2+1), taxPercent: (0+1), subtotal: (2+1), tax: (0+1), total: 0})

            expect(taxSelector(renderCounter)).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: (3+1), taxPercent: (1+1), subtotal: (3+1), tax: (1+1), total: 0})

            expect(totalSelector(renderCounter)).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: (4+2), taxPercent: (2+1), subtotal: (4+2), tax: (2+1), total: (0+1)})

            expect(totalSelector(renderCounter)).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: (6+2), taxPercent: (3+1), subtotal: (6+2), tax: (3+1), total: (1+1)})

            break

          case 2:
            expect(callCounter).to.deep.equal({shopItems: 8, taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged (deep equality)
            expect(subtotalSelector(renderCounter)).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: (8+1), taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged (deep equality)
            expect(subtotalSelector(renderCounter)).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: (9+1), taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged (deep equality)
            expect(taxSelector(renderCounter)).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: (10+1), taxPercent: (4+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged (deep equality)
            expect(taxSelector(renderCounter)).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: (11+1), taxPercent: (5+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged (deep equality)
            expect(totalSelector(renderCounter)).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: (12+2), taxPercent: (6+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged (deep equality)
            expect(totalSelector(renderCounter)).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: (14+2), taxPercent: (7+1), subtotal: 8, tax: 4, total: 2})

            break

          case 3:
            expect(callCounter).to.deep.equal({shopItems: 16, taxPercent: 8, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged (deep equality)
            expect(subtotalSelector(renderCounter)).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: (16+1), taxPercent: 8, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged (deep equality)
            expect(subtotalSelector(renderCounter)).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: (17+1), taxPercent: 8, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged (deep equality)
            expect(taxSelector(renderCounter)).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: (18+1), taxPercent: (8+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged (deep equality)
            expect(taxSelector(renderCounter)).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: (19+1), taxPercent: (9+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged (deep equality)
            expect(totalSelector(renderCounter)).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: (20+2), taxPercent: (10+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged (deep equality)
            expect(totalSelector(renderCounter)).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: (22+2), taxPercent: (11+1), subtotal: 8, tax: 4, total: 2})

            done()
            break
        }
      }
      catch (err) {
        console.log(err)
        done(err)
      }

      return React.createElement('div', null, 'Render count: ' + JSON.stringify(renderCounter))
    }

    render(Component)
  })

  // ===============================================================================================

}
