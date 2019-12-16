const React         = require('react')
const {useDispatch} = require('@warren-bank/unified-redux-react-hook')  // {StoreContext, addDispatch, removeDispatch, useDispatch, useReduxDispatch, useReduxMappedState, useReduxSelector}
const SiteSettings  = require('./SiteSettings')
const ToDoList      = require('./ToDoList')

const {useReducer, useState, useCallback} = React

const reactThemes = {
  light: {
    padding:         "20px",
    backgroundColor: "#eeeeee",
    color:           "#000000"
  },
  dark: {
    padding:         "20px",
    backgroundColor: "#222222",
    color:           "#ffffff"
  }
}
const reactInitialState = reactThemes.light
const reactReducer = (state, action) => {
  switch (action.type) {
    case 'REACT_STORE':
      return reactThemes[action.payload]
    default:
      return state
  }
}

const App = () => {
  const [reactState, reactDispatcher] = useReducer(reactReducer, reactInitialState)
  const unifiedDispatcher             = useDispatch(reactDispatcher)

  const [text, updateText] = useState('')

  const handleChange = useCallback((e) => {
    updateText(e.target.value)
  }, [])

  const handleSubmit = useCallback((e) => {
    e.preventDefault()

    if (text) {
      unifiedDispatcher({type: 'REDUX_STORE', payload: text})
      updateText('')
    }
  }, [text])

  return (
    <div style={reactState}>
      <header>
        <SiteSettings />
      </header>
      <main>
        <ToDoList />
      </main>
      <footer>
        <form onSubmit={handleSubmit}>
          <input value={text}  onChange={handleChange} />
          <input type="submit" value="Add" />
        </form>
      </footer>
    </div>
  )
}

module.exports = App
