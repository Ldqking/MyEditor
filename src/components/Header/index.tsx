
import { useCallback, useEffect, useState } from 'react';
import styles from "./index.module.scss";
import CommonBtn from '../CommonBtn';
import { enterFullscreen } from '../../utils/tools';
import dataJson from './../../assets/meta2d.202542094020.json'

const Header = () => {
  const [penStatus, setPenStatus] = useState(false);
  const [pencilStatus, setPencilStatus] = useState(false);
  const [magnifierStatus, setMagnifierStatus] = useState(false);
  const [minimapStatus, setMinimapStatus] = useState(false);
  const [lockStatus, setLockStatus] = useState(false);
  const [fullScreenStatus, setFullScreenStatus] = useState(false);

  const onCreate = useCallback(() => {
    window.MyEditor.open();
  }, []);

  const onOpen = useCallback((e:any) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result === 'string') {
          const json = JSON.parse(result);
          window.MyEditor.open(json);
        } else {
          console.log('读取文件失败，内容不是字符串');
        }
      } catch(e) {
        console.log('读取文件失败，请检查数据格式');
      }
    };
    reader.readAsText(file);
  }, []);

  const onSave = useCallback(() => {
    const filename = '测试数据.json';
    const data = window.MyEditor.data();
    const json = JSON.stringify(data, undefined, 4);
    const blob = new Blob([ json ], { type: 'text/json' });
    const a = document.createElement('a');
    a.download = filename;
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
    a.click();
  }, []);

  const onTogglePen = useCallback(() => {
    if (penStatus) {
      setPenStatus(false);
      window.MyEditor.drawLine();
      window.MyEditor.finishDrawLine();
      return;
    }
    setPencilStatus(false);
    window.MyEditor.stopPencil();
    setPenStatus(true);
    window.MyEditor.drawLine('curve');
  }, [penStatus]);

  const onTogglePencil = useCallback(() => {
    if (pencilStatus) {
      setPencilStatus(false);
      window.MyEditor.stopPencil();
      return;
    }
    setPenStatus(false);
    window.MyEditor.drawLine();
    window.MyEditor.finishDrawLine();
    setPencilStatus(true);
    window.MyEditor.drawingPencil();
  }, [pencilStatus]);

  const onToggleMagnifier = useCallback(() => {
    if (magnifierStatus) {
      setMagnifierStatus(false);
      window.MyEditor.hideMagnifier();
      return;
    }
    setMagnifierStatus(true);
    window.MyEditor.showMagnifier();
  }, [magnifierStatus]);

  const onToggleMinimap = useCallback(() => {
    if (minimapStatus) {
      setMinimapStatus(false);
      window.MyEditor.hideMap();
      return;
    }
    setMinimapStatus(true);
    window.MyEditor.showMap();
  }, [minimapStatus]);

  const onLock = useCallback(() => { 
    if (lockStatus) {
      setLockStatus(false);
      window.MyEditor.lock(0);
      return;
    }
    setLockStatus(true);
    window.MyEditor.lock(10);
  }, [lockStatus]);

  //全屏
  const onFullScreen = useCallback(() => { 
    //获取Id为meta2d的元素
    const element = document.getElementById('root');
    enterFullscreen(element)
    setFullScreenStatus(true)
  }, [fullScreenStatus]);

  // const onKeyDown = useCallback((e:any) => {
  //   switch (e.key) {
  //     case 'b':
  //     case 'B':
  //       if (window.MyEditor.canvas.pencil && pencilBtn.current) {
  //         pencilBtn.current.className = 'active';
  //       } else if (pencilBtn.current) {
  //         pencilBtn.current.className = '';
  //       }
  //       break;
  //     case 'v':
  //     case 'V':
  //       if (e.ctrlKey || e.metaKey) {
  //         return;
  //       } else {
  //         if (window.MyEditor.canvas.drawingLineName && penBtn.current) {
  //           penBtn.current.className = 'active';
  //         } else if (penBtn.current) {
  //           penBtn.current.className = '';
  //         }
  //       }
  //       break;
  //     case 'm':
  //     case 'M':
  //       if (window.MyEditor.canvas.magnifier && minimapBtn.current) {
  //         minimapBtn.current.className = 'active';
  //       } else if (minimapBtn.current) {
  //         minimapBtn.current.className = '';
  //       }
  //       break;
  //     case 'Escape':
  //       penBtn.current!.className = '';
  //       pencilBtn.current!.className = '';
  //       magnifierBtn.current!.className = '';
  //       break;
  //     default:
  //       break;
  //   }
  // }, []);
  // 监听全屏状态变化
function handleFullscreenChange() {
    const fullscreenElement = document.fullscreenElement;
    if (!fullscreenElement) {
        setFullScreenStatus(false)
    } 
}

// 添加跨浏览器事件监听

useEffect(() => {
    setTimeout(() => {
      window.MyEditor.open(dataJson as any);
    }, 1000*2)
    window.addEventListener('fullscreenchange', handleFullscreenChange);
    // window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('fullscreenchange', handleFullscreenChange);
      // window.removeEventListener('keydown', onKeyDown);
    }
  }, []);

  return (
    <div className={styles.header} >
      <div className="logo" >
        <div className={styles.title}>2.5D组态编辑器</div>
      </div>
      <div className={styles.buttonGroup} >
        <CommonBtn onClick = { onCreate } >新建</CommonBtn>
        <CommonBtn myStyle={{position: 'relative'}}>打开<input id="open-input" type="file" onChange = { onOpen } /></CommonBtn>
        <CommonBtn onClick = { onSave } >保存</CommonBtn>
        <CommonBtn onClick = { onTogglePen } active = { penStatus } >钢笔</CommonBtn>
        <CommonBtn onClick = { onTogglePencil } active = { pencilStatus } >铅笔</CommonBtn>
        <CommonBtn onClick = { onToggleMagnifier } active = { magnifierStatus } >放大镜</CommonBtn>
        <CommonBtn onClick = { () => {window.MyEditor.undo()} } >撤销</CommonBtn>

      </div>
      <div className={styles.buttonGroup} style={{marginRight: '10px'}}>
        <CommonBtn onClick = { onLock } >{ lockStatus ? '编辑': '锁定' }</CommonBtn>
        <CommonBtn onClick = { onFullScreen } myStyle={{display: fullScreenStatus ? 'none' : ''}} >全屏</CommonBtn>
        <CommonBtn onClick = { onToggleMinimap } active = { minimapStatus } >缩略图</CommonBtn>
        <CommonBtn onClick = { ()=>{} } myStyle={{cursor: 'not-allowed'}} >预览</CommonBtn>
        <CommonBtn onClick = { ()=>{} } myStyle={{cursor: 'not-allowed'}} >发布</CommonBtn>
      </div>
    </div>
  );
};

export default Header;