import { useState } from 'react'
import DynamicForm from '../../../components/dynamicForm'
import { Card, Form } from 'antd'
import { initUser, rulePassword, titleForm } from '../../../constants';
import { User } from '../../../interfaces';
import { TypeRute } from '../../../types';
import HeaderView from "../../../components/headerView";

const UsersRegister = () => {
  const [form] = Form.useForm();
  const [type, setType] = useState<TypeRute>("create");
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User>(initUser)

  const onFinish = async () => {

  }

  return (
    <div>
      <HeaderView
        title={titleForm[type]}
        path="/usuarios"
        goBack
      />
      <Card>
        <DynamicForm
          form={form}
          layout='vertical'
          loading={saving}
          onFinish={onFinish}
          justify="center"
          inputs={[
            {
              typeControl: 'input',
              typeInput: 'text',
              label: 'Nombre',
              name: 'name',
              rules: [{ required: true, message: 'Favor de escribir el nombre del usuario.' }],
              value: user.name,
              onChange: (value: string) => setUser({ ...user, name: value }),
              md: 8
            },
            {
              typeControl: 'input',
              typeInput: 'email',
              label: 'Correo',
              name: 'email',
              value: user.email,
              onChange: (value: string) => setUser({ ...user, email: value }),
              md: 8
            },
            {
              typeControl: 'phone',
              label: 'Teléfono',
              name: 'phone',
              value: user.phone,
              onChange: (value: string) => setUser({ ...user, phone: value }),
              md: 8
            },
            {
              typeControl: 'select',
              label: 'Empresa',
              name: 'company',
              value: user.company,
              onChange: (value: string) => setUser({ ...user, company: value }),
              md: 8
            },
            {
              md: 8,
              typeControl: "input",
              typeInput: "password",
              label: "Contraseña",
              name: "password",
              rules: [rulePassword],
            },
            {
              md: 8,
              typeControl: "input",
              typeInput: "password",
              label: "Confirmar contraseña",
              name: "confirmPassword",
              rules: [rulePassword],
            },
          ]}
        />
      </Card>
    </div>
  )
}

export default UsersRegister;