/* src/App.js */
import React, { useEffect, useState } from 'react'
import { API, graphqlOperation } from 'aws-amplify'
import { createTodo, createProfile } from './graphql/mutations'
import { listTodos, getProfile } from './graphql/queries'
import { Auth } from 'aws-amplify';

const initialState = { name: '', description: '' }

const App = () => {

  const [formState, setFormState] = useState(initialState)
  const [todos, setTodos] = useState([])
  const [loginState, setLoginState] = useState(false)
  const [getProfileState, setProfileState] = useState({})

  useEffect(() => {
    fetchTodos()
  }, [])

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value })
  }

  async function signIn() {
    try {
        const user = await Auth.signIn("Testman", "password");
        setLoginState(true)
    } catch (error) {
        console.log('error signing in', error);
    }
  }

  async function signOut() {
    try {
        await Auth.signOut();
        setLoginState(false)
    } catch (error) {
        console.log('error signing out: ', error);
    }
}

async function getProfileData() {
  const id = "c7d65630-da1c-4a63-a349-5d94c570d975"
  try {
    const profileData = await API.graphql(graphqlOperation(getProfile, {id: id}))
    const profile = profileData.data.getProfile
    setProfileState(profile)
  } catch (err) { console.log('error fetching profile') }
}

  async function fetchTodos() {
    try {
      const todoData = await API.graphql(graphqlOperation(listTodos))
      const todos = todoData.data.listTodos.items
      setTodos(todos)
    } catch (err) { console.log('error fetching todos') }
  }

  async function addProfile() {
    const profile = { username: "James"}
    try {
      await API.graphql(graphqlOperation(createProfile, {input: profile}))
    }
    catch (err) {
      console.log('error creating profile:', err)
    }
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.description) return
      const todo = { ...formState }
      setTodos([...todos, todo])
      setFormState(initialState)
      await API.graphql(graphqlOperation(createTodo, {input: todo}))
    } catch (err) {
      console.log('error creating todo:', err)
    }
  }

  return (

    <div style={styles.container}>
      {/* <h2>Amplify Todos</h2>
      <input
        onChange={event => setInput('name', event.target.value)}
        style={styles.input}
        value={formState.name} 
        placeholder="Name"
      />
      <input
        onChange={event => setInput('description', event.target.value)}
        style={styles.input}
        value={formState.description}
        placeholder="Description"
      /> */}

      {
        loginState ? <button onClick = {signOut}> Logout </button> : <button onClick = {signIn}> Sign In </button> 
      }

      <button onClick = {getProfileData}> Get Profile </button>

      {/* <button style={styles.button} onClick={addTodo}>Create Todo</button>
      {
        todos.map((todo, index) => (
          <div key={todo.id ? todo.id : index} style={styles.todo}>
            <p style={styles.todoName}>{todo.name}</p>
            <p style={styles.todoDescription}>{todo.description}</p>
          </div>
        ))
      } */}
    </div>
  )
}

const styles = {
  container: { width: 400, margin: '0 auto', display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center', padding: 20 },
  todo: {  marginBottom: 15 },
  input: { border: 'none', backgroundColor: '#ddd', marginBottom: 10, padding: 8, fontSize: 18 },
  todoName: { fontSize: 20, fontWeight: 'bold' },
  todoDescription: { marginBottom: 0 },
  button: { backgroundColor: 'black', color: 'white', outline: 'none', fontSize: 18, padding: '12px 0px' }
}

export default App
