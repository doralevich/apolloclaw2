'use client';
import { useEffect } from 'react';

export default function NotFound() {
  useEffect(() => {
    window.location.href = 'https://calendly.com/apolloclaw/30-minute-meeting-clone';
  }, []);

  return null;
}
