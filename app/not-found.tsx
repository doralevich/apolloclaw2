'use client';
import { useEffect } from 'react';

export default function NotFound() {
  useEffect(() => {
    window.location.href = 'https://cal.com/therealdaveo/apollo-claw';
  }, []);

  return null;
}
