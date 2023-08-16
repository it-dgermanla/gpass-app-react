import { Dispatch, SetStateAction } from "react";
import dayjs from "dayjs";
import { UserAdmin } from "../interfaces/user";

export type Users = UserAdmin;
export type Rols = "SuperAdministrador" | "Administrador" | "Embajador" | "Lector";
export type OptionsValue = string | number | Boolean | dayjs.Dayjs | null | undefined;
export type TypeControl = 'input' | 'select' | 'date' | 'checkbox' | 'radio' | 'autocomplete' | 'textarea' | 'file' | 'timeRangePicker' | 'phone';
export type TypeInput = 'text' | 'number' | 'password' | 'email';
export type TypeRute = "create" | "update";
export type DS<T> = Dispatch<SetStateAction<T>>;