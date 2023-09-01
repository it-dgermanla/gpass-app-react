import { collection, addDoc, updateDoc, doc, getDoc, query, getDocs, QueryConstraint } from "firebase/firestore";
import { db } from '../firebaseConfig';
import { handleError } from '../utils/functions';
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { UploadFile } from "antd";
import { urlImageDefaultEvent, urlImageDefaultCompany, baseUrlStorage } from "../constants";

const storage = getStorage();
const basesUrlsImagesByCollection: Record<string, string> = {
  "Events": urlImageDefaultEvent,
  "Companies": urlImageDefaultCompany
}

export const add = async <T extends { id?: string }>(collectionName: string, data: Record<string, any>) => {
  try {
    const _data = { ...data };

    if (_data?.image?.length) {
      const imgUploadFile = _data?.image[0] as UploadFile;

      if (imgUploadFile.url?.includes(baseUrlStorage)) {
        _data.image = imgUploadFile.url;
      } else {
        _data.image = await uploadFile(imgUploadFile.originFileObj!, collectionName);
      }
    } else {
      _data.image = basesUrlsImagesByCollection[collectionName] || "";
    }

    const docRef = await addDoc(collection(db, collectionName), _data);

    return { id: docRef.id, ..._data } as T;
  } catch (error) {
    throw handleError(error);
  }
}

export const update = async <T extends { id?: string }>(collectionName: string, id: string, data: Record<string, any>) => {
  try {
    if (data?.image?.length) {
      const imgUploadFile = data?.image[0] as UploadFile;

      if (imgUploadFile.url?.includes(baseUrlStorage)) {
        data.image = imgUploadFile.url;
      } else {
        data.image = await uploadFile(imgUploadFile.originFileObj!, collectionName);
      }
    }

    await updateDoc(doc(db, collectionName, id), data);

    return { id, ...data } as T;
  } catch (error) {
    throw handleError(error);
  }
}

export const getDocById = (collectionName: string, id: string) => getDoc(doc(db, collectionName, id));

export const getDocByIdGeneric = async <T extends { id?: string }>(collectionName: string, id: string) => {
  try {
    const d = await getDoc(doc(db, collectionName, id));

    return { id: d.id, ...d.data() } as T;
  } catch (error) {
    throw handleError(error);
  }
}

export const getGenericDocById = async <T extends { id?: string }>(collectionName: string, id: string) => {
  try {
    const document = await getDoc(doc(db, collectionName, id));

    return { id, ...document.data() } as T;
  } catch (error) {
    throw handleError(error);
  }
}

export const uploadFile = async (file: File, path: string) => {
  try {
    const completePath = path + "/" + new Date().getTime().toString() + " - " + file.name;
    const storageRef = ref(storage, completePath);

    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  } catch (error) {
    throw handleError(error);
  }
}

export const getCollection = (path: string, _query: QueryConstraint[]) => getDocs(query(collection(db, path), ..._query))

export const getCollectionGeneric = async <T>(path: string, _query: QueryConstraint[]) => {
  try {
    const { docs } = await getDocs(query(collection(db, path), ..._query))

    return docs.map(d => ({
      id: d.id,
      ...d.data()
    })) as T[]
  } catch (error) {
    throw handleError(error);
  }
}