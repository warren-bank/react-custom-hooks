const React            = require('react')
const {useReduxMappedState} = require('@warren-bank/unified-redux-react-hook')  // {StoreContext, addDispatch, removeDispatch, useDispatch, useReduxDispatch, useReduxMappedState, useReduxSelector}

const ToDoList = () => {
  const todos = useReduxMappedState(reduxState => reduxState.todos)

  return (
    <>
      <h3>To Dos:</h3>
      <ul>
        {todos.map(todo => (<li>{todo}</li>))}
      </ul>
    </>
  )
}

module.exports = ToDoList
