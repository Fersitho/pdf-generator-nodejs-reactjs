import { createBrowserRouter } from "react-router-dom"
import { lazy } from "react"
import loadable from '@loadable/component'

// import Home from "./src/containers/global/Home"
// import Home2 from "./src/containers/global/Home2"
// import ErrorPage from "./src/components/ErrorPage"

const Home = loadable(() => import('./src/pages/Home'),{ fallback: <h1>Cargando...</h1>})
const ErrorPage = loadable(() => import('./src/components/ErrorPage'),{ fallback: <h1>Cargando...</h1>})

// const Home = lazy(() => import('./src/containers/global/Home'))
// const Home2 = lazy(() => import('./src/containers/global/Home2'))
// const ErrorPage = lazy(() => import('./src/components/ErrorPage'))

const routerApp = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <ErrorPage />
  },
  
]);




export default routerApp