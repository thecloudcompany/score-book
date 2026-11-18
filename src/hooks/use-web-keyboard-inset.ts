import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

/** Height covered by the on-screen keyboard in a mobile browser (0 elsewhere). Native uses KeyboardAvoidingView. */
export function useWebKeyboardInset(): number {
  const [inset, setInset] = useState(0);
  useEffect(() => {
    const viewport = Platform.OS === 'web' ? window.visualViewport : null;
    if (!viewport) return;
    const update = () => {
      const covered = window.innerHeight - viewport.height - viewport.offsetTop;
      setInset(covered > 80 ? Math.round(covered) : 0);
    };
    update();
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);
    return () => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
    };
  }, []);
  return inset;
}
