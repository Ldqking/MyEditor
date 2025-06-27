import type { Meta2d } from '@meta2d/core'
import './App.css'
import ContainerMeta2D from './components/ContainerMeta2D'
import Header from './components/Header'
import LeftList from './components/LeftList'
import RightView from './components/RightView'

declare global {
  interface Window {
    MyEditor: Meta2d;
  }
}

function App() {
  return (
    <>
      <Header />
      <LeftList />
      <RightView />
      <ContainerMeta2D />
    </>
  )
}

export default App
