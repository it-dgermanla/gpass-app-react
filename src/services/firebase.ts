import { collection, addDoc } from "firebase/firestore";
import { db } from '../firebaseConfig';
import { handleError } from '../utils/functions';

export const addDataTable = async <T>(collectionName: string, data: Record<string, any>) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    if (!docRef.id) {
      throw handleError(docRef);
    }
    return docRef;
  } catch (error) {
    throw handleError(error);
  }

}