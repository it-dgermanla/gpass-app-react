import { useEffect, useState } from 'react'
import { getDocs, Timestamp, query as q, collection as col, QueryConstraint, getFirestore } from 'firebase/firestore';
import moment from 'moment-timezone';

export interface PropsUseCollection<T> {
  collection: string;
  query: QueryConstraint[];
  extraPropsByItemArray?: Record<string, any>;
  whitPropsDateFormated?: boolean;
  formatDate?: string;
  wait?: boolean;
  initLoading?: boolean;
}

const useCollection = <T extends {}>({ collection, query, extraPropsByItemArray, whitPropsDateFormated, formatDate, wait, initLoading = true }: PropsUseCollection<T>) => {
  const [loading, setLoading] = useState<boolean>(initLoading);
  const [data, setData] = useState<Array<T>>([]);
  const [error, setError] = useState<unknown>()

  useEffect(() => {
    let mounted = true;

    if (wait) return;

    const init = async () => {
      try {
        setLoading(true);

        const _snapshot = await getDocs(q(col(getFirestore(), collection), ...query));

        if (!mounted) return;

        setData(
          _snapshot.docs.map(d => {
            let dataDoc = d.data();

            Object.keys(dataDoc).forEach(key => {
              if (dataDoc[key] instanceof Timestamp) {
                const date = dataDoc[key].toDate();
                dataDoc[key] = date;

                if (whitPropsDateFormated) {
                  dataDoc[key + "Formated"] = moment(date).format(formatDate);
                }
              }
            });

            if (extraPropsByItemArray) {
              dataDoc = {
                ...dataDoc,
                ...extraPropsByItemArray
              };
            }

            return { ...dataDoc, id: d.id } as unknown as T;
          }) as Array<T>
        );
      } catch (error) {
        console.log(error);
        setError(error);
      } finally {
        if (!mounted) return;

        setLoading(false);
      }
    }

    init();

    return () => {
      mounted = false;
    }
  }, [query, extraPropsByItemArray, whitPropsDateFormated, formatDate, collection, wait]);

  return { loading, data, setData, error };
}

export default useCollection;