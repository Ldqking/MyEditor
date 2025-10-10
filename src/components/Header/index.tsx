import styles from './index.module.scss'

function Header() {
  return (
    <div className={styles.header}>
      <div className={styles.title}>城市规划</div>
      <img src="./images/border.png" alt="border" />
    </div>
  )
}

export default Header