import { Button, Drawer, List } from 'antd';
import styles from './index.module.scss'
import { useState } from 'react';
import { IMGLIST } from '../../utils/enum';

function ImgList({onDragEnd}: { onDragEnd: (url: string, position: number[], wh: number[]) => void }) {
  const [visible, setVisible] = useState(false);
  const toggleDrawer = () => {
    setVisible(!visible);
  };

  //图片URL列表
  const images = IMGLIST;

  const ResourceItem = ({ image }: { image: string }) => {
    return (
      <img
        src={image}
        alt="resource"
        style={{ width: '100%', cursor: 'move'}}
        // onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      />
    );
  };

  const handleDragEnd = (e:any) => {
    // console.log('[ e ]', e)
    const parsedUrl = new URL(e.target.currentSrc);
    const pathAfterBaseUrl = parsedUrl.pathname;
    // console.log('[ pathAfterBaseUrl ]', pathAfterBaseUrl)
    onDragEnd(pathAfterBaseUrl, [e.clientX, e.clientY], [e.target.width, e.target.height])
  };
  return (
    <>
      <Button type="primary" shape="round" className={!visible ? styles.openBtn : styles.closeBtn} onClick={toggleDrawer}>
        {visible ? '<' : '>'}
      </Button>

      <Drawer
        title={`Image List`}
        placement="left"
        closable={false}
        // onClose={toggleDrawer}
        mask={false}
        open={visible}
        width={"200px"}
      >
        <List
          grid={{ gutter: 16, column: 1 }}
          dataSource={images}
          renderItem={(item) => (
            <List.Item>
              <ResourceItem image={item} />
            </List.Item>
          )}
        />
      </Drawer>
    </>
  );
}

export default ImgList