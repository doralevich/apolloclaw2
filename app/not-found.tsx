'use client';
import { useEffect } from 'react';

export default function NotFound() {
  useEffect(() => {
    window.location.href = 'https://calendly.com/therealdaveo/apolloai';
  }, []);

  return null;
}
