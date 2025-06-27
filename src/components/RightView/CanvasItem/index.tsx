import Collapse, { type CollapseProps } from "antd/es/collapse";
import styles from "./index.module.scss";
import Input from "antd/es/input";
import Select from "antd/es/select";
import CanvasSet from "./canvasSet";

function CanvasItem() {
  const items: CollapseProps['items'] = [
    {
      key: '1',
      label: '文件',
      children: fileSet(),
    },
    {
      key: '2',
      label: '画布',
      children: <CanvasSet />,
    },
  ];

  function fileSet() {
    return (
      <div className={styles.fileSet}>
        <div className={styles.setItem}>
          <span className={styles.label}>文件名</span>
          <Input className={styles.value} placeholder="file name" />
        </div>
        <div className={styles.setItem}>
          <span className={styles.label}>分类</span>
          <Select
            defaultValue="1"
            style={{ width: 190 }}
            className={styles.value}
            options={[{ value: '1', label: '项目A' }, { value: '2', label: '项目B' }]}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.canvasItem}>
      <Collapse defaultActiveKey={[1, 2]} ghost expandIconPosition={'end'} items={items} />
    </div>
  );
}

export default CanvasItem;