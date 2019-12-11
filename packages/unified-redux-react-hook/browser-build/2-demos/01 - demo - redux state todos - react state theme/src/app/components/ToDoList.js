const React            = require('react')
const {useMappedState} = require('@warren-bank/unified-redux-react-hook')  // {StoreContext, addDispatch, removeDispatch, useDispatch, useReduxDispatch, useMappedState}

const ToDoList = () => {
  const todos = useMappedState(reduxState => reduxState.todos)

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
