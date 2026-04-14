import { Outlet } from "react-router-dom"
import { initSocket, disconnectSocket } from "./services/socket/socket"
import { useAppDispatch, useAppSelector } from "./App/hooks"
import { registerSocketListener } from "./services/socket/socketListeners"
import { useEffect } from "react"
import { getUser } from "./features/auth/authSlice"
import { getOnlineUser } from "./features/user/userSlice"

function App() {
  const { isAuthenticated } = useAppSelector(state => state.auth)
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(getUser())
  }, [dispatch])

  useEffect(() => {
    if (isAuthenticated) {
      const socket = initSocket()
      registerSocketListener(socket)

      dispatch(getOnlineUser()) 
    }

    return () => {
      disconnectSocket()
    }
  }, [isAuthenticated, dispatch])

  return <Outlet />
}

export default App
