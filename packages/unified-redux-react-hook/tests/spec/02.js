/*
 * https://github.com/facebookincubator/redux-react-hook
 */

{
  const expect        = require('expect')
  const {createStore} = require('redux')
  const React         = require('react')
  const ReactDOM      = require('react-dom')
  const {StoreContext, addDispatch, removeDispatch, useDispatch, useReduxDispatch, useReduxMappedState, useReduxSelector} = require('@warren-bank/unified-redux-react-hook')

  // ===============================================================================================

  const containerParent = document.getElementById('mocha')
  let container, reduxStore

  beforeEach(() => {
    container = document.createElement('div')
    containerParent.appendChild(container)

    const reduxReducer = (state = {}, action) => action.payload
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

    const Component = () => {

      const subtotalSelector = useReduxSelector(
        shopItemsSelector,
        (items) => {
          const result = items.reduce((acc, item) => acc + item.value, 0)
          return result
        }
      )

      const taxSelector = useReduxSelector(
        subtotalSelector,
        taxPercentSelector,
        (subtotal, taxPercent) => {
          const result = subtotal * (taxPercent / 100)
          return result
        }
      )

      const totalSelector = useReduxSelector(
        subtotalSelector,
        taxSelector,
        (subtotal, tax) => {
          const result = { total: subtotal + tax }
          return result
        }
      )

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

    const Component = () => {

      const subtotalSelector = useReduxSelector(
        [shopItemsSelector],
        (items) => {
          const result = items.reduce((acc, item) => acc + item.value, 0)
          return result
        }
      )

      const taxSelector = useReduxSelector(
        [subtotalSelector, taxPercentSelector],
        (subtotal, taxPercent) => {
          const result = subtotal * (taxPercent / 100)
          return result
        }
      )

      const totalSelector = useReduxSelector(
        [subtotalSelector],
        taxSelector,
        (subtotal, tax) => {
          const result = { total: subtotal + tax }
          return result
        }
      )

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

}
