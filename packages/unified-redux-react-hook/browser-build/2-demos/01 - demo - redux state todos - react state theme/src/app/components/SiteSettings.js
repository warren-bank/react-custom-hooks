const React         = require('react')
const {useDispatch} = require('@warren-bank/unified-redux-react-hook')  // {StoreContext, addDispatch, removeDispatch, useDispatch, useReduxDispatch, useReduxMappedState, createReduxSelector}

const SiteSettings = () => {
  const unifiedDispatcher = useDispatch()

  const changeTheme = (mode) => {
    unifiedDispatcher({type: 'REACT_STORE', payload: mode})
  }

  return (
    <>
      <h3>Site Settings</h3>
      <div>
        <span>Change Theme: </span>
        <button value="dark"  onClick={e => changeTheme(e.target.value)}>Dark</button>
        <button value="light" onClick={e => changeTheme(e.target.value)}>Light</button>
      </div>
    </>
  )
}

module.exports = SiteSettings
