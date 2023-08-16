import { UploadFile } from "antd/es/upload";
import { Rols } from "../types";

export interface User {
  id?: string;
  uid?: string;
  role: Rols;
  name?: string;
  email: string;
  phone?: string;
  description: string;
  active: boolean;
  image?: UploadFile<any>[] | string;
  password?: string;
  confirmPassword?: string;
}

export interface UserAdmin extends User {
  company?: string;
  rfc?: string;
}