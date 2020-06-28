import React, { useState, useEffect, useRef, MutableRefObject } from 'react';
import { Stream, HTMLStreamElement } from '@cloudflare/stream-react';
import { useLocation } from 'react-router-dom';

const setServiceData = async (serviceName: string, setStartTime: Function, setSrc: Function): Promise<void> => {
  const serverResponse = await fetch(`/serviceData/${serviceName}`);
  const serviceData = await serverResponse.json();
  
  if (serviceData && serviceData.startTimestamp && serviceData.src) {
    setStartTime(Math.round(new Date().getTime() / 1000) - parseInt(serviceData.startTimestamp));
    setSrc(serviceData.src);
  } else {
    throw new Error('Something went wrong fetching the data for the service');
  }
}

const CloudflareStream = () => {
  const [startTime, setStartTime] = useState(0);
  const [src, setSrc] = useState('');
  const location = useLocation();
  const streamRef = useRef<HTMLStreamElement>(null) as MutableRefObject<HTMLStreamElement>;

  useEffect(() => {
    streamRef.current?.classList.add('stream');
    const { pathname } = location;
    const serviceName = pathname.slice(pathname.lastIndexOf('/') + 1);
    
    setServiceData(serviceName, setStartTime, setSrc);
  }, [location, streamRef, setStartTime]);

  return (src !== '' &&
    <Stream
      autoplay
      controls
      muted
      currentTime={startTime}
      preload="auto" 
      src={src}
      streamRef={streamRef}
      onPause={() => streamRef.current.play()}
    />
  );
};

export default CloudflareStream;
