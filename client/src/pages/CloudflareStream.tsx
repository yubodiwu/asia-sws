import React, { useState, useEffect } from 'react';
import { Stream } from '@cloudflare/stream-react';
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

  useEffect(() => {
    const { pathname } = location;
    const serviceName = pathname.slice(pathname.lastIndexOf('/') + 1);
    
    setServiceData(serviceName, setStartTime, setSrc);
  }, [location]);

  return (src !== '' &&
    <Stream
      autoplay
      currentTime={startTime}
      preload="auto" 
      src={src}
    />
  );
};

export default CloudflareStream;
