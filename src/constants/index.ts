import { FormRule } from "antd";
import { TypeRute } from "../types";
import { Company, User } from "../interfaces";

/* export const urlImageDefaultProfile = "https://firebasestorage.googleapis.com/v0/b/delivery-hmo.appspot.com/o/imagenesPerfil%2F1467646262_522853_1467646344_noticia_normal.jpg?alt=media&token=f6e761ad-95c5-462f-bc39-0e889ac30a5c";
export const baseUrlStorage = "https://firebasestorage.googleapis.com/v0/b/delivery-hmo.appspot.com/o/";
export const baseUrlStorageGCP = "https://storage.googleapis.com/delivery-hmo.appspot.com/images/";
 */

export const urlImageDefaultCompany = "https://firebasestorage.googleapis.com/v0/b/gpass-apps.appspot.com/o/company%2Fcompany.png?alt=media&token=4a25e724-96c5-4303-bbfd-0e2d03a2ccc1";

export const initCompany: Company = {
  id: "",
  name: "",
  email: "",
  phone: "",
  image: "",
  address: "",
  disable: false
};

export const initUser: User = {
  name: "",
  email: "",
  phone: "",
  company: "",
  passowrd: "",
  confirmPassword: "",
};

export const rulePhoneInput: FormRule = {
  required: true,
  message: 'El número telefónico tiene que ser de 10 dígitos.',
  validator: (rule, value?: string) => value?.length !== 10 ? Promise.reject(rule.message) : Promise.resolve(),
} as const;
export const ruleMaxLength: FormRule = {
  max: 300,
  message: "El texto no puede tener más de 300 caracteres."
} as const;
export const ruleEmail: FormRule = {
  required: true,
  message: 'Favor de escribir un correo electrónico válido.',
  type: "email"
} as const;
export const rulePassword: FormRule = {
  required: true,
  min: 6,
  message: 'La contraseña tiene que ser de 6 dígitos o más.'
} as const;
export const titleForm: Record<TypeRute, string> = {
  create: "Registrar",
  update: "Editar"
} as const;
