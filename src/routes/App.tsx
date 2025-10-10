import './App.module.scss'
import Header from '../components/Header'
import MyCanvas from '../components/MyCanvas'
import { useEffect, useState } from 'react'
import ImgList from '../components/ImgList'

function App() {
  const [boudingInfo, setBoudingInfo] = useState<null | [number, number]>(null)
  useEffect(() => {
    const rect = document.body.getBoundingClientRect();
    // console.log('[ rect ]', rect)
    setBoudingInfo([rect.width, rect.height])
  }, [])

  const [dragInfo, setDragInfo] = useState({imgUrl: '', position: [0, 0], wh: [100, 100]})

  const handleDragEnd = (url: string, position: number[], wh: number[]) => {
    console.log('[ url ]', url)
    console.log('[ position ]', position, wh)
    setDragInfo({imgUrl: url, position, wh})
  }

  return (
    <>
      <div>
        <Header></Header>
        {boudingInfo && (
          <MyCanvas
            width={boudingInfo[0]}
            height={boudingInfo[1] - 70}
            dragInfo={dragInfo}
          ></MyCanvas>
        )}
        <ImgList onDragEnd={handleDragEnd} />
      </div>  
    </>
  )
}

export default App
