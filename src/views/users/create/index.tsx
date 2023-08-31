import { useState, useEffect } from 'react'
import DynamicForm from '../../../components/dynamicForm'
import { Card, Form, message } from 'antd'
import { initUser, rulePassword, titleForm } from '../../../constants';
import { User, Option, Company } from '../../../interfaces';
import { Rols, TypeRute } from '../../../types';
import HeaderView from "../../../components/headerView";
import { add, getCollectionGeneric, update } from '../../../services/firebase';
import { where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const roles = [
  {
    value: 'Administrador',
    text: 'Administrador'
  },
  ,
  {
    value: 'Embajador',
    text: 'Embajador'
  },
  ,
  {
    value: 'Lector',
    text: 'Lector'
  }
]
const collection = "Users";

const UsersRegister = () => {
  const navigate = useNavigate();

  const [form] = Form.useForm();
  const [type, setType] = useState<TypeRute>("create");
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User>(initUser)
  const [companies, setCompanies] = useState<Option[]>()

  const dataCompanies = async () => {
    const response = await getCollectionGeneric<Company>('Companies', [where("disabled", "==", false)])
    if (!response) return

    const selectComapanies = response.map((company) => {
      return {
        value: company.name + "-" + company.id,
        text: company.name
      }
    })

    setCompanies(selectComapanies as Option[])
  }

  useEffect(() => {
    dataCompanies()
  }, [])

  const onFinish = async () => {
    if (saving) return;

    setSaving(true);

    const { password, confirmPassword } = user;
    
    if (confirmPassword !== password) {
      message.error('Las contraseñas no coinciden.');
      setSaving(false)
      return;
    }

    delete user.confirmPassword;

    try {
      if (type === "update") {
        const id = user.id!;

        delete user.id;

        await update(collection, id, user);
      } else {
        await add(collection, user);
      }

      message.success('Usuario guardado con éxito.', 4);
      navigate('/usuarios')
    } finally {
      setSaving(false)
    }
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
              value: user.companyName,
              onChange: (value: string) => setUser({ ...user, companyName: value.split("-")[0], companyUid: value.split("-")[1] }),
              md: 6,
              options: companies
            },
            {
              typeControl: 'select',
              label: 'Rol',
              name: 'role',
              value: user.role,
              onChange: (value: Rols) => setUser({ ...user, role: value }),
              md: 6,
              options: roles as Option[]
            },
            {
              md: 6,
              typeControl: "input",
              typeInput: "password",
              label: "Contraseña",
              name: "password",
              value: user.password,
              onChange: (value: Rols) => setUser({ ...user, password: value }),
              rules: [rulePassword],
            },
            {
              md: 6,
              typeControl: "input",
              typeInput: "password",
              label: "Confirmar contraseña",
              name: "confirmPassword",
              value: user.confirmPassword,
              onChange: (value: Rols) => setUser({ ...user, confirmPassword: value }),
              rules: [rulePassword],
            },
          ]}
        />
      </Card>
    </div>
  )
}

export default UsersRegister;