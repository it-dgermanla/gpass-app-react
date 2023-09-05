import MyRouter from './router';
import { AuthProvider } from './context/authContext';
import 'dayjs/locale/es';
import locale from 'antd/locale/es_ES'
import { ConfigProvider } from 'antd';

const App = () => {
  return (
    <ConfigProvider locale={locale}>
      <AuthProvider>
        <MyRouter />
      </AuthProvider>
    </ConfigProvider>
  )
}

export default App;
