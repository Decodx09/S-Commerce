import React from 'react'
import {Routes , Route} from 'react-router-dom'
import home from './pages/home'

const Shivansh = () => {
  return (
    <Routes>
      <Route path='/' element={home}/>
    </Routes>
  )
}

export default Shivansh