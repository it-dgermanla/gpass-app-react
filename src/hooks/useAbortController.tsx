import { useEffect, useRef } from 'react'

const useAbortController = () => {
  const abortControllerRef = useRef<AbortController | undefined>();

  useEffect(() => {
    abortControllerRef.current = new AbortController();

    return () => {
      if (process.env.NODE_ENV !== "development") abortControllerRef.current?.abort();
    }
  }, []);

  return abortControllerRef;
}

export default useAbortController;