"use client";

import { useEffect, useState } from "react";
import { Analytics } from '@vercel/analytics/react';

function loadConsent(): boolean {
  try {
    const raw = localStorage.getItem('cookie-consent');
    if (!raw) return false;
    const c = JSON.parse(raw);
    return !!c.analytics;
  } catch { return false; }
}

function injectGA() {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
  if (!GA_ID) return;
  if (document.getElementById('ga4-src')) return;
  const s = document.createElement('script');
  s.id = 'ga4-src';
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  s.async = true;
  document.head.appendChild(s);
  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag(...args: any[]) { (window as any).dataLayer.push(args); }
  (window as any).gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_ID);
}

function cleanupGA() {
  // Remove GA script(s)
  const gaScript = document.getElementById('ga4-src');
  if (gaScript) gaScript.remove();
  // Remove any gtm scripts accidentally loaded
  document.querySelectorAll('script[src*="googletagmanager"],script[src*="gtag/js"]').forEach(el => el.remove());
  // Clear dataLayer & gtag
  try {
    delete (window as any).gtag;
    if (Array.isArray((window as any).dataLayer)) (window as any).dataLayer.length = 0;
    delete (window as any).dataLayer;
  } catch {}
}

export default function AnalyticsGate() {
  const [allow, setAllow] = useState<boolean>(false);

  useEffect(() => {
    setAllow(loadConsent());
    const handler = () => {
      const next = loadConsent();
      if (next && !allow) {
        injectGA();
      } else if (!next && allow) {
        cleanupGA();
      }
      setAllow(next);
    };
    window.addEventListener('cookie-consent-changed', handler);
    // If already allowed at mount, inject
    if (loadConsent()) injectGA();
    return () => window.removeEventListener('cookie-consent-changed', handler);
  }, [allow]);

  return allow ? <Analytics /> : null;
}
