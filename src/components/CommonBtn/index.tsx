import styles from './index.module.scss';
function CommonBtn({ onClick, myStyle, children, refs, active }: { onClick?: () => void, myStyle?: any, children?: any, refs?: any, active?: boolean }) { 
  return (
    <div
      ref = {refs}
      className={styles.commonBtn}
      onClick={onClick}
      style={{
        borderColor: active ? '#4096ff' : '#ccc',
        color: active ? '#4096ff' : 'black',
        ...myStyle
      }}
    >
      {children}
    </div>
  );
}

export default CommonBtn;