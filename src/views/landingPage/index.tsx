import React from 'react';
import { Button, Form, Input, Card } from 'antd';
import '../../assets/styles/login.css';
import logo from '../../assets/logo.png';

const onFinish = (values: any) => {
  console.log('Success:', values);
};

const onFinishFailed = (errorInfo: any) => {
  console.log('Failed:', errorInfo);
};

type FieldType = {
  username?: string;
  password?: string;
};

const App: React.FC = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#F5F5F5' }}>
    <Card
      className='app-login-card'
      style={{
        background: '#fff',
        border: 'none',
        borderRadius: 7,
        padding: '1em',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: 400,
        marginTop: '2em',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1em' }}>
        <img src={logo} alt="Logo" style={{ width: '50%', height: 'auto' }} />
      </div>

      <Form
        name="basic"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item<FieldType>
          label="Username"
          name="username"
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item<FieldType>
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password />
        </Form.Item>

        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '1em' }}>
          <Button type="primary" htmlType="submit" style={{ width: '120px' }}>
            Submit
          </Button>
        </div>
      </Form>
    </Card>
  </div>
);

export default App;