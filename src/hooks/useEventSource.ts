import { useEffect } from 'react';

export const useEventSource = (
  url: string | null,
  onMessage: (data: any) => void,
  onError?: () => void
) => {
  useEffect(() => {
    if (!url) return;

    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      onMessage(JSON.parse(event.data));
    };

    eventSource.onerror = () => {
      if (onError) onError();
      eventSource.close();
    };

    return () => {
      eventSource.close();
      console.log('EventSource closed during cleanup.');
    };
  }, [url]);
};