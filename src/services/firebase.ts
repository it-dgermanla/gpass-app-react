import { collection, addDoc, updateDoc, doc, getDoc } from "firebase/firestore";
import { db } from '../firebaseConfig';
import { handleError } from '../utils/functions';
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { UploadFile } from "antd";
import { urlImageDefaultEvent } from "../constants";

const storage = getStorage();
const basesUrlsImages = [urlImageDefaultEvent];
const basesUrlsImagesByCollection: Record<string, string> = {
  "Events": urlImageDefaultEvent
}

export const add = async <T extends { id?: string }>(collectionName: string, data: Record<string, any>) => {
  try {

    if (data.image) {
      if (data?.image?.length) {
        const imgUploadFile = data?.image[0] as UploadFile;

        if (!basesUrlsImages.includes(imgUploadFile.url!)) {
          data.image = await uploadFile(imgUploadFile.originFileObj!, collectionName);
        }
      } else {
        data.image = basesUrlsImagesByCollection[collectionName] || "";
      }
    }

    const docRef = await addDoc(collection(db, collectionName), data);

    return { id: docRef.id, ...data } as T;
  } catch (error) {
    throw handleError(error);
  }
}

export const update = async <T extends { id?: string }>(collectionName: string, id: string, data: Record<string, any>) => {
  try {
    if (data?.image?.length) {
      const imgUploadFile = data?.image[0] as UploadFile;

      if (!basesUrlsImages.includes(imgUploadFile.url!)) {
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