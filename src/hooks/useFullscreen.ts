// Bật/tắt chế độ toàn màn hình (hữu ích khi chiếu lên lớp).
import { useCallback, useEffect, useState } from 'react';

export interface FullscreenControls {
  isFullscreen: boolean;
  toggle(): void;
  enter(): void;
  exit(): void;
}

export function useFullscreen(): FullscreenControls {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const enter = useCallback(() => {
    document.documentElement.requestFullscreen?.().catch(() => undefined);
  }, []);

  const exit = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => undefined);
  }, []);

  const toggle = useCallback(() => {
    if (document.fullscreenElement) exit();
    else enter();
  }, [enter, exit]);

  return { isFullscreen, toggle, enter, exit };
}
