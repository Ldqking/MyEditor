import Tabs, { type TabsProps } from 'antd/es/tabs';
import styles from './index.module.scss'
import { useEffect, useState } from 'react';
import CanvasItem from './CanvasItem';

function RightView() {
  const onChange = (key: string) => {
    console.log(key);
  };

  const pelItems: TabsProps['items'] = [
    {
      key: '11',
      label: '属性',
      children: 'Content of Tab Pane 1',
    },
    {
      key: '12',
      label: '事件',
      children: 'Content of Tab Pane 2',
    },
    {
      key: '13',
      label: '动效',
      children: 'Content of Tab Pane 3',
    },
    {
      key: '14',
      label: '数据',
      children: 'Content of Tab Pane 423',
    },
  ];
  const canvasItems: TabsProps['items'] = [
    {
      key: '1',
      label: '图纸',
      children: <CanvasItem />,
    },
    {
      key: '2',
      label: '通信',
      children: 'Content of Tab Pane 2',
    },
    {
      key: '3',
      label: '结构',
      children: 'Content of Tab Pane 3',
    }
  ]


  const [pelActive, setPelActive] = useState<boolean>(false);
  
  useEffect(() => {
    const handleClick = () => { 
      const ACTIVE = window.MyEditor?.store.active;
      if (ACTIVE && ACTIVE.length > 0) {
        setPelActive(true);
      } else {
        setPelActive(false);
      }
    };
    setTimeout(() => { 
      window.MyEditor?.on('add-pel', ()=> {
        // console.log('[ add-pel ]', e)
        setPelActive(true);
      });
    }, 1000);

    const ele = document.getElementById('meta2d-container');
    ele?.addEventListener('click', handleClick);
    return () => {
      ele?.removeEventListener('click', handleClick);
      window.MyEditor?.off('add-pel', ()=> {
        setPelActive(true);
      });
    };
  }, [])

  return (
    <div className={styles.rightView}>
      <div className={styles.tit}>
        <Tabs defaultActiveKey="1" items={pelActive? pelItems : canvasItems} onChange={onChange} />
      </div>
    </div>
  );
}

export default RightView;