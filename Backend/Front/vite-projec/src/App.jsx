import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useEffect } from 'react'
import axios, { Axios } from 'axios'

function App() {
  const [jokes,setjokes]=useState([])
  

  useEffect(()=>{
    axios.get('/api/jokes') // use proxy for the url
    .then((response)=>{
      console.log(response.data)
      setjokes(response.data)
    }).catch((error)=>{
      console.log(error) 
    })
  })


  return (
    <>
      <h1>This is the FrontEnd</h1>
      <p>{jokes.length}</p>
      {
        jokes.map((jokes,index)=>(
          <div key={jokes.id}>
            <h3>{jokes.id}</h3>
            <h4>{jokes.joke}</h4>

          </div>
        ))
      }
    </>
  )
}

export default App
