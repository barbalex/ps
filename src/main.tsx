import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './style.css'

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
// causes LabelGenerator to run twice
// .render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
// )
