/*
 * https://github.com/facebookincubator/redux-react-hook
 */

describe('createReduxSelector()', () => {
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

  const initReduxState = () => {
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
  }

  const createSelectors = (shallow, spread_input_selectors) => {
    // https://github.com/reduxjs/reselect#reselect

    const callCounter = {shopItems: 0, taxPercent: 0, subtotal: 0, tax: 0, total: 0}

    let innerShopItemsSelector, equality, input_selectors

    if (typeof shallow !== 'boolean') {
      innerShopItemsSelector = state => state.shop.items
      equality = null
    }
    else if (shallow === true) {
      innerShopItemsSelector = state => ([...state.shop.items])
      equality = 'shallow'
    }
    else if (shallow === false) {
      innerShopItemsSelector = state => state.shop.items.map(item => ({...item}))
      equality = 'deep'
    }

    const shopItemsSelector = (state, ...params) => {
      if (params && params.length)
        console.log('"shopItemsSelector" params:',  ...params)
      callCounter.shopItems++
      return innerShopItemsSelector(state)
    }

    const taxPercentSelector = (state, ...params) => {
      if (params && params.length)
        console.log('"taxPercentSelector" params:', ...params)
      callCounter.taxPercent++
      return state.shop.taxPercent
    }

    const get_input_selectors = (...input_selectors) => {
      if (!spread_input_selectors)
        input_selectors = [input_selectors]
      return input_selectors
    }

    input_selectors = get_input_selectors(shopItemsSelector)
    const subtotalSelector = createReduxSelector(
      ...input_selectors,
      (items) => {
        callCounter.subtotal++
        const result = items.reduce((acc, item) => acc + item.value, 0)
        return result
      },
      {equality}
    )

    input_selectors = get_input_selectors(subtotalSelector, taxPercentSelector)
    const taxSelector = createReduxSelector(
      ...input_selectors,
      (subtotal, taxPercent) => {
        callCounter.tax++
        const result = subtotal * (taxPercent / 100)
        return result
      },
      {equality}
    )

    input_selectors = get_input_selectors(subtotalSelector, taxSelector)
    const totalSelector = createReduxSelector(
      ...input_selectors,
      (subtotal, tax) => {
        callCounter.total++
        const result = { total: subtotal + tax }
        return result
      },
      {equality}
    )

    return {shopItemsSelector, taxPercentSelector, subtotalSelector, taxSelector, totalSelector, callCounter}
  }

  const Components = {

    // ===============================================================================================================================================
    expect_return_values: ({shopItemsSelector, taxPercentSelector, subtotalSelector, taxSelector, totalSelector, callCounter, done}) => {
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
    },

    // ===============================================================================================================================================
    expect_memoInput_memoResult_updateReactState_noParams: ({shopItemsSelector, taxPercentSelector, subtotalSelector, taxSelector, totalSelector, callCounter, done}) => {
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

            // 'inputSelectors' are NOT called because Redux state is unchanged, 'resultFunc' is NOT called because derived values are unchanged
            expect(subtotalSelector()).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: 8, taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are NOT called because Redux state is unchanged, 'resultFunc' is NOT called because derived values are unchanged
            expect(subtotalSelector()).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: 8, taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are NOT called because Redux state is unchanged, 'resultFunc' is NOT called because derived values are unchanged
            expect(taxSelector()).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: 8, taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are NOT called because Redux state is unchanged, 'resultFunc' is NOT called because derived values are unchanged
            expect(taxSelector()).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: 8, taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are NOT called because Redux state is unchanged, 'resultFunc' is NOT called because derived values are unchanged
            expect(totalSelector()).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: 8, taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are NOT called because Redux state is unchanged, 'resultFunc' is NOT called because derived values are unchanged
            expect(totalSelector()).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: 8, taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            break

          case 3:
            expect(callCounter).to.deep.equal({shopItems: 8, taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are NOT called because Redux state is unchanged, 'resultFunc' is NOT called because derived values are unchanged
            expect(subtotalSelector()).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: 8, taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are NOT called because Redux state is unchanged, 'resultFunc' is NOT called because derived values are unchanged
            expect(subtotalSelector()).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: 8, taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are NOT called because Redux state is unchanged, 'resultFunc' is NOT called because derived values are unchanged
            expect(taxSelector()).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: 8, taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are NOT called because Redux state is unchanged, 'resultFunc' is NOT called because derived values are unchanged
            expect(taxSelector()).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: 8, taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are NOT called because Redux state is unchanged, 'resultFunc' is NOT called because derived values are unchanged
            expect(totalSelector()).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: 8, taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are NOT called because Redux state is unchanged, 'resultFunc' is NOT called because derived values are unchanged
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
    },

    // ===============================================================================================================================================
    expect_invalidateInput_memoResult_updateReduxState_noParams: ({shopItemsSelector, taxPercentSelector, subtotalSelector, taxSelector, totalSelector, callCounter, done}) => {
      const mapState      = (state) => state.nonce || 1
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

            // 'inputSelectors' are called because Redux state has changed, 'resultFunc' is NOT called because derived values are unchanged
            expect(subtotalSelector()).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: (8+1), taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because Redux state has changed, 'resultFunc' is NOT called because derived values are unchanged
            expect(subtotalSelector()).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: (9+1), taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because Redux state has changed, 'resultFunc' is NOT called because derived values are unchanged
            expect(taxSelector()).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: (10+1), taxPercent: (4+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because Redux state has changed, 'resultFunc' is NOT called because derived values are unchanged
            expect(taxSelector()).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: (11+1), taxPercent: (5+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because Redux state has changed, 'resultFunc' is NOT called because derived values are unchanged
            expect(totalSelector()).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: (12+2), taxPercent: (6+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because Redux state has changed, 'resultFunc' is NOT called because derived values are unchanged
            expect(totalSelector()).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: (14+2), taxPercent: (7+1), subtotal: 8, tax: 4, total: 2})

            break

          case 3:
            expect(callCounter).to.deep.equal({shopItems: 16, taxPercent: 8, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because Redux state has changed, 'resultFunc' is NOT called because derived values are unchanged
            expect(subtotalSelector()).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: (16+1), taxPercent: 8, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because Redux state has changed, 'resultFunc' is NOT called because derived values are unchanged
            expect(subtotalSelector()).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: (17+1), taxPercent: 8, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because Redux state has changed, 'resultFunc' is NOT called because derived values are unchanged
            expect(taxSelector()).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: (18+1), taxPercent: (8+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because Redux state has changed, 'resultFunc' is NOT called because derived values are unchanged
            expect(taxSelector()).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: (19+1), taxPercent: (9+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because Redux state has changed, 'resultFunc' is NOT called because derived values are unchanged
            expect(totalSelector()).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: (20+2), taxPercent: (10+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because Redux state has changed, 'resultFunc' is NOT called because derived values are unchanged
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
    },

    // ===============================================================================================================================================
    expect_invalidateInput_memoResult_updateReactState_hasParams: ({shopItemsSelector, taxPercentSelector, subtotalSelector, taxSelector, totalSelector, callCounter, done}) => {
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

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged
            expect(subtotalSelector(renderCounter)).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: (8+1), taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged
            expect(subtotalSelector(renderCounter)).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: (9+1), taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged
            expect(taxSelector(renderCounter)).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: (10+1), taxPercent: (4+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged
            expect(taxSelector(renderCounter)).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: (11+1), taxPercent: (5+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged
            expect(totalSelector(renderCounter)).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: (12+2), taxPercent: (6+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged
            expect(totalSelector(renderCounter)).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: (14+2), taxPercent: (7+1), subtotal: 8, tax: 4, total: 2})

            break

          case 3:
            expect(callCounter).to.deep.equal({shopItems: 16, taxPercent: 8, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged
            expect(subtotalSelector(renderCounter)).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: (16+1), taxPercent: 8, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged
            expect(subtotalSelector(renderCounter)).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: (17+1), taxPercent: 8, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged
            expect(taxSelector(renderCounter)).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: (18+1), taxPercent: (8+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged
            expect(taxSelector(renderCounter)).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: (19+1), taxPercent: (9+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged
            expect(totalSelector(renderCounter)).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: (20+2), taxPercent: (10+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged
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
    },

    // ===============================================================================================================================================
    expect_invalidateInput_memoResult_updateReduxState_hasParams: ({shopItemsSelector, taxPercentSelector, subtotalSelector, taxSelector, totalSelector, callCounter, done}) => {
      const mapState      = (state) => state.nonce || 1
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

            // 'inputSelectors' are called because both (a) Redux state has changed (b) input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged
            expect(subtotalSelector(renderCounter)).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: (8+1), taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because both (a) Redux state has changed (b) input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged
            expect(subtotalSelector(renderCounter)).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: (9+1), taxPercent: 4, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because both (a) Redux state has changed (b) input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged
            expect(taxSelector(renderCounter)).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: (10+1), taxPercent: (4+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because both (a) Redux state has changed (b) input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged
            expect(taxSelector(renderCounter)).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: (11+1), taxPercent: (5+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because both (a) Redux state has changed (b) input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged
            expect(totalSelector(renderCounter)).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: (12+2), taxPercent: (6+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because both (a) Redux state has changed (b) input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged
            expect(totalSelector(renderCounter)).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: (14+2), taxPercent: (7+1), subtotal: 8, tax: 4, total: 2})

            break

          case 3:
            expect(callCounter).to.deep.equal({shopItems: 16, taxPercent: 8, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because both (a) Redux state has changed (b) input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged
            expect(subtotalSelector(renderCounter)).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: (16+1), taxPercent: 8, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because both (a) Redux state has changed (b) input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged
            expect(subtotalSelector(renderCounter)).to.equal(2.15)
            expect(callCounter).to.deep.equal({shopItems: (17+1), taxPercent: 8, subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because both (a) Redux state has changed (b) input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged
            expect(taxSelector(renderCounter)).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: (18+1), taxPercent: (8+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because both (a) Redux state has changed (b) input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged
            expect(taxSelector(renderCounter)).to.equal(0.172)
            expect(callCounter).to.deep.equal({shopItems: (19+1), taxPercent: (9+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because both (a) Redux state has changed (b) input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged
            expect(totalSelector(renderCounter)).to.deep.equal({total: 2.322})
            expect(callCounter).to.deep.equal({shopItems: (20+2), taxPercent: (10+1), subtotal: 8, tax: 4, total: 2})

            // 'inputSelectors' are called because both (a) Redux state has changed (b) input parameter value has changed, 'resultFunc' is NOT called because derived values are unchanged
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
    },

    // ===============================================================================================================================================
  }

  const render = (Component, props) => {
    ReactDOM.render(
      //<StoreContext.Provider value={reduxStore}><Component {...props} /></StoreContext.Provider>,
      React.createElement(StoreContext.Provider, {value: reduxStore}, React.createElement(Component, props)),
      container
    )
  }

  // =============================================================================================== only 1 render

  it('runs official "reselect" demo, call signature: (...inputSelectors, resultFunc)', (done) => {
    initReduxState()
    const Component = Components.expect_return_values
    const props = createSelectors(null, true)        // {shopItemsSelector, taxPercentSelector, subtotalSelector, taxSelector, totalSelector, callCounter}
    render(Component, {...props, done})
  })

  // ===============================================================================================

  it('runs official "reselect" demo, call signature: ([inputSelectors], resultFunc)', (done) => {
    initReduxState()
    const Component = Components.expect_return_values
    const props     = createSelectors(null, false)   // {shopItemsSelector, taxPercentSelector, subtotalSelector, taxSelector, totalSelector, callCounter}
    render(Component, {...props, done})
  })

  // =============================================================================================== equality: reference

  it('uses memoization: no input parameters, Redux state is not modified, reference equality', (done) => {
    initReduxState()
    const Component = Components.expect_memoInput_memoResult_updateReactState_noParams
    const props     = createSelectors(null, false)   // {shopItemsSelector, taxPercentSelector, subtotalSelector, taxSelector, totalSelector, callCounter}
    render(Component, {...props, done})
  })

  // ===============================================================================================

  it('uses memoization: no input parameters, Redux state is modified, reference equality', (done) => {
    initReduxState()
    const Component = Components.expect_invalidateInput_memoResult_updateReduxState_noParams
    const props     = createSelectors(null, false)   // {shopItemsSelector, taxPercentSelector, subtotalSelector, taxSelector, totalSelector, callCounter}
    render(Component, {...props, done})
  })

  // ===============================================================================================

  it('uses memoization: has input parameters, Redux state is not modified, reference equality', (done) => {
    initReduxState()
    const Component = Components.expect_invalidateInput_memoResult_updateReactState_hasParams
    const props     = createSelectors(null, false)   // {shopItemsSelector, taxPercentSelector, subtotalSelector, taxSelector, totalSelector, callCounter}
    render(Component, {...props, done})
  })

  // ===============================================================================================

  it('uses memoization: has input parameters, Redux state is modified, reference equality', (done) => {
    initReduxState()
    const Component = Components.expect_invalidateInput_memoResult_updateReduxState_hasParams
    const props     = createSelectors(null, false)   // {shopItemsSelector, taxPercentSelector, subtotalSelector, taxSelector, totalSelector, callCounter}
    render(Component, {...props, done})
  })

  // =============================================================================================== equality: shallow

  it('uses memoization: no input parameters, Redux state is not modified, shallow equality', (done) => {
    initReduxState()
    const Component = Components.expect_memoInput_memoResult_updateReactState_noParams
    const props     = createSelectors(true, false)   // {shopItemsSelector, taxPercentSelector, subtotalSelector, taxSelector, totalSelector, callCounter}
    render(Component, {...props, done})
  })

  // ===============================================================================================

  it('uses memoization: no input parameters, Redux state is modified, shallow equality', (done) => {
    initReduxState()
    const Component = Components.expect_invalidateInput_memoResult_updateReduxState_noParams
    const props     = createSelectors(true, false)   // {shopItemsSelector, taxPercentSelector, subtotalSelector, taxSelector, totalSelector, callCounter}
    render(Component, {...props, done})
  })

  // ===============================================================================================

  it('uses memoization: has input parameters, Redux state is not modified, shallow equality', (done) => {
    initReduxState()
    const Component = Components.expect_invalidateInput_memoResult_updateReactState_hasParams
    const props     = createSelectors(true, false)   // {shopItemsSelector, taxPercentSelector, subtotalSelector, taxSelector, totalSelector, callCounter}
    render(Component, {...props, done})
  })

  // ===============================================================================================

  it('uses memoization: has input parameters, Redux state is modified, shallow equality', (done) => {
    initReduxState()
    const Component = Components.expect_invalidateInput_memoResult_updateReduxState_hasParams
    const props     = createSelectors(true, false)   // {shopItemsSelector, taxPercentSelector, subtotalSelector, taxSelector, totalSelector, callCounter}
    render(Component, {...props, done})
  })

  // =============================================================================================== equality: deep

  it('uses memoization: no input parameters, Redux state is not modified, deep equality', (done) => {
    initReduxState()
    const Component = Components.expect_memoInput_memoResult_updateReactState_noParams
    const props     = createSelectors(false, false)  // {shopItemsSelector, taxPercentSelector, subtotalSelector, taxSelector, totalSelector, callCounter}
    render(Component, {...props, done})
  })

  // ===============================================================================================

  it('uses memoization: no input parameters, Redux state is modified, deep equality', (done) => {
    initReduxState()
    const Component = Components.expect_invalidateInput_memoResult_updateReduxState_noParams
    const props     = createSelectors(false, false)  // {shopItemsSelector, taxPercentSelector, subtotalSelector, taxSelector, totalSelector, callCounter}
    render(Component, {...props, done})
  })

  // ===============================================================================================

  it('uses memoization: has input parameters, Redux state is not modified, deep equality', (done) => {
    initReduxState()
    const Component = Components.expect_invalidateInput_memoResult_updateReactState_hasParams
    const props     = createSelectors(false, false)  // {shopItemsSelector, taxPercentSelector, subtotalSelector, taxSelector, totalSelector, callCounter}
    render(Component, {...props, done})
  })

  // ===============================================================================================

  it('uses memoization: has input parameters, Redux state is modified, deep equality', (done) => {
    initReduxState()
    const Component = Components.expect_invalidateInput_memoResult_updateReduxState_hasParams
    const props     = createSelectors(false, false)  // {shopItemsSelector, taxPercentSelector, subtotalSelector, taxSelector, totalSelector, callCounter}
    render(Component, {...props, done})
  })

  // ===============================================================================================
})
