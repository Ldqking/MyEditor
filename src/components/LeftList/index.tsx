import { useEffect, useCallback, useState } from 'react';
import styles from './index.module.scss';
import Collapse, { type CollapseProps } from 'antd/es/collapse';
import { baseIcons, cityList, flowChart } from '../../utils/enums';

const LeftList: React.FC = () => {
  const [commonUse, setCommonUse] = useState<any[]>(() => {
    const savedData = localStorage.getItem('commonUse');
    return savedData ? JSON.parse(savedData) : [];
  });

  useEffect(() => {
    localStorage.setItem('commonUse', JSON.stringify(commonUse));
  }, [commonUse]);

  const onDragStart = useCallback((e: any, data: any, used: any) => {
    // 检查是否已存在具有相同 id 的对象
    const existingIndex = commonUse.findIndex(item => item.id === used.id);
    let updatedCommonUse = [...commonUse];

    // 如果存在，删除旧的对象
    if (existingIndex !== -1) {
      updatedCommonUse.splice(existingIndex, 1);
    }
    updatedCommonUse.unshift(used);

    // 确保数组长度不超过 9
    if (updatedCommonUse.length > 9) {
      updatedCommonUse.pop();
    }
    setCommonUse(updatedCommonUse);

    e.dataTransfer.setData('Meta2d', JSON.stringify(data));
    if (JSON.parse(localStorage.getItem('gridAdsorption')?? 'false')) {
      // console.log('[ JSON.parse(localStorage.getItem("gridAdsorption")?? "false") ]', JSON.parse(localStorage.getItem('gridAdsorption')?? 'false'))
      console.log('[ data ]', data)
      // let target = window.MyEditor.findOne('id');
      window.MyEditor.alignPenToGrid(data);
    }
    window.MyEditor.emit('add-pel', data);
  }, [commonUse]);

  //基本图形
  function baseIcon(list: any[]) {
    return (
      <div className={styles.iconList} >
        {list.map((icon) => {
          const { key, title, data, id } = icon;
          return data.name !== 'image' ?
           (
            <div
              key={id}
            >
              <i
                draggable
                className={`iconfont icon-${key}`}
                title={title}
                onDragStart={(e) => onDragStart(e, data, icon)}
              ></i>
            </div>
          ) : (
            <div
              key={id}
              className={styles.items}
            >
              <img
                draggable
                className={styles.img}
                title={title}
                src={data.image}
                onDragStart={(e) => onDragStart(e, data, icon)}
              />
            </div>
          )
        })}
      </div>
    )
  }

  const items: CollapseProps['items'] = [
    {
      key: '1',
      label: '常用图元',
      children: baseIcon(commonUse),
    },
    {
      key: '2',
      label: '基本图形',
      children: baseIcon(baseIcons),
    },
    {
      key: '3',
      label: '流程图',
      children: baseIcon(flowChart),
    },
     {
      key: '4',
      label: '2.5D城市',
      children: baseIcon(cityList),
    },
  ];

  return (
    <div className={styles.aside} >
      <Collapse accordion defaultActiveKey={['2']} ghost expandIconPosition={'end'} items={items} />
    </div>
  );
};

export default LeftList;
