import { useRef, useState } from 'react';

// React가 다시 렌더링되기 전의 연속 입력도 즉시 차단합니다.
export default function useRequestLock() {
  const locked = useRef(false);
  const [pending, setPending] = useState(false);
  const run = async (request: () => Promise<unknown>) => {
    if (locked.current) {
      return;
    }
    locked.current = true;
    setPending(true);
    try {
      await request();
    } finally {
      locked.current = false;
      setPending(false);
    }
  };
  return { pending, run };
}
