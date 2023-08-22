import { collection, addDoc } from "firebase/firestore";
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