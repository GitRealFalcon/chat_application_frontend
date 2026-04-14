import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { createBrowserRouter } from 'react-router-dom'
import Protected from './components/authLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import { RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './App/store'
import Home2 from './pages/Home2'
import { ThemeProvider } from './components/theme-provider'


const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>,
    children:[
      {
        path:"/",
        element:(
          <Protected authentication={true}>
            <Home/>
          </Protected>
        )
      },
      {
        path:"/home",
        element: <Home2/>
      },
      {
        path:"/register",
        element:<Register/>
      },
      {
        path:"/login",
        element:<Login/>
      }
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
  <Provider store={store}>
    <RouterProvider router={router}/>

  </Provider>
  </ThemeProvider>
)
