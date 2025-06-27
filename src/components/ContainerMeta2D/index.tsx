import { useEffect, useRef } from 'react';
import { Meta2d } from '@meta2d/core';
import { flowPens } from "@meta2d/flow-diagram";
import styles from './index.module.scss'

const ContainerMeta2D = () => {
  let meta2d = useRef(null);
  useEffect(() => {
    if (meta2d.current) {
      (window as any).MyEditor = new Meta2d(meta2d.current);
      (window as any).MyEditor.register(flowPens());
    }
  }, []);

  return (
    <div className={styles.main} id='meta2d-container' >
      <div className={styles.meta2d} ref={meta2d} id="meta2d"></div>
    </div>
  );
};

export default ContainerMeta2D;