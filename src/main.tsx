import './index.css'
import './common.scss'
import 'antd/dist/reset.css'; // 使用新版本的 antd 推荐使用 reset.css 而不是之前的 antd.css
import App from './routes/App.tsx'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import ReactDOM from "react-dom/client";
import Test from './routes/test/index.tsx';

const router = createHashRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/test',
    element: <Test />,
  },
])

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <RouterProvider router={router} />
);

