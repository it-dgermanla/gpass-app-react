import React, { useState } from 'react';
import { Button, Form, Input, Card, message } from 'antd';
import '../../assets/styles/login.css';
import logo from '../../assets/logo.png';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";

interface SignUp {
  email: string;
  password: string;
};

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: SignUp) => {
    if (loading) return;

    setLoading(true);

    try {
      /* const userCredencial =  */await signInWithEmailAndPassword(auth, values.email, values.password);
      //await updateProfile(userCredencial.user, { displayName: "SuperAdministrador" });
    } catch (error) {
      console.log(error);
      message.error('Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#F5F5F5' }}>
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
          autoComplete="off"
        >
          <Form.Item<SignUp>
            label="Correo"
            name="email"
            rules={[{ required: true, message: 'Correo electronico requerido!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item<SignUp>
            label="Contraseña"
            name="password"
            rules={[{ required: true, message: 'Contraseña requerida!' }]}
          >
            <Input.Password />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '1em' }}>
            <Button
              loading={loading}
              type="primary"
              htmlType="submit"
              style={{ width: '120px' }}
            >
              Entrar
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default App;