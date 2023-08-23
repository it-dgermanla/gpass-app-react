import { Rols, TypeControl, TypeInput } from "../types";
import { UploadFile } from "antd/es/upload";
import { FormRule } from 'antd';
import { UploadListType } from 'antd/lib/upload/interface';
import { Dayjs } from "dayjs";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Event {
  id?: string;
  name: string;
  initialDate: Date;
  finalDate: Date;
  initialDateFormated?: string;
  finalDateFormated?: string;
  image?: UploadFile<any>[] | string;
  disable?: boolean;
  createAt: Date;
}

export type EventForm = Omit<Event, "initialDate" | "finalDate"> & {
  initialDate: Dayjs
  finalDate: Dayjs
}

export interface Company {
  id?: string;
  name: string;
  phone: string;
  email: string;
  image?: UploadFile<any>[] | string;
  address?: string;
  disable?: boolean;
}

export interface User {
  id?: string;
  name: string;
  phone: string;
  email: string;
  company: Company | string;
  passowrd: string;
  confirmPassword: string;
  role?: Rols;
}

export interface CustomInput {
  typeControl: TypeControl;
  typeInput?: TypeInput;
  value?: any;
  name: string;
  md?: number;
  label?: string;
  options?: Option[];
  show?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  rules?: FormRule[];
  onChange?: (value: any) => void;
  styleFI?: React.CSSProperties;
  required?: boolean;
  accept?: string;
  maxCount?: number;
  multiple?: boolean;
  loading?: boolean;
  listType?: UploadListType;
}

export interface Option {
  value: string | number;
  text: string;
}