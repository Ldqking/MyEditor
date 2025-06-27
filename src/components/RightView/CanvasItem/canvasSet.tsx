import ColorPicker from "antd/es/color-picker";
import Upload, { type UploadProps } from "antd/es/upload";
import { useEffect, useState } from "react";
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { beforeUpload } from "../../../utils/tools";
import styles from "./index.module.scss";
import Switch from "antd/es/switch";

const CanvasSet: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>();

  const getBase64 = (img: any, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result as string));
    reader.readAsDataURL(img);
  };

  const handleChange: UploadProps['onChange'] = (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      getBase64(info.file.originFileObj as any, (url) => {
        setLoading(false);
        setImageUrl(url);
      });
    }
  };

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  const onBgColorChange = (_value: any, css: string) => {
    window.MyEditor.setBackgroundColor(css);
    window.MyEditor.render();
  };


  const onGridColorChange = (_value: any, css: string) => {
    window.MyEditor.setGrid({
      gridColor: css
    });
    window.MyEditor.render();
  };

  const onGridChange = (value: boolean) => {
    console.log('[ value ]', value)
    window.MyEditor.setGrid({
      grid: value
    });
    window.MyEditor.render();
  };

  const onGridAdsorption = (value: boolean) => {
    localStorage.setItem('gridAdsorption', JSON.stringify(value));
  };

  useEffect(() => {
    let timer = setInterval(() => {
      const store = window.MyEditor.store.data;
      console.log('[ store ]', store)
    }, 1000 * 5);
    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className={styles.fileSet}>
      <div className={styles.setItem}>
        <span className={styles.label}>背景颜色</span>
        <ColorPicker style={{ width: 130 }} defaultValue={window.MyEditor?.store.data.background??'#fff'} showText allowClear onChange={onBgColorChange} />
      </div>
      <div className={styles.setItem}>
        <span className={styles.label}>背景图片</span>
        <Upload
          name="avatar"
          listType="picture-card"
          className="avatar-uploader"
          showUploadList={false}
          beforeUpload={beforeUpload}
          onChange={handleChange}
        >
          {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
        </Upload>
      </div>
      <div className={styles.setItem}>
        <span className={styles.label}>背景网格</span>
        <Switch onChange={onGridChange} defaultChecked={window.MyEditor?.store.data.grid ?? false} />
      </div>
      <div className={styles.setItem}>
        <span className={styles.label}>网格颜色</span>
        <ColorPicker style={{ width: 130 }} defaultValue={window.MyEditor?.store.data.gridColor?? "#ccc7c7"} showText allowClear onChange={onGridColorChange} />
      </div>
      <div className={styles.setItem}>
        <span className={styles.label}>网格吸附</span>
        <Switch onChange={onGridAdsorption} />
      </div>
    </div>
  );
};

export default CanvasSet;