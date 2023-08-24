import { collection, addDoc, updateDoc, doc, getDoc } from "firebase/firestore";
import { db } from '../firebaseConfig';
import { handleError } from '../utils/functions';

export const add = async <T extends { id?: string }>(collectionName: string, data: Record<string, any>) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    return { id: docRef.id, ...data } as T;
  } catch (error) {
    throw handleError(error);
  }
}

export const update = async <T extends { id?: string }>(collectionName: string, id: string, data: Record<string, any>) => {
  try {
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