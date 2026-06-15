import { useEffect } from 'react';
import Head from 'next/head';
import '@/styles/globals.css'
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from 'next-themes';
import { preloadOnMount } from '@/lib/preload';

export default function App({ Component, pageProps }) {
  // On app mount, warm the API if user is already logged in
  useEffect(() => {
    preloadOnMount();
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <Head>
        <title>OPAL Facility Management System</title>
        <meta name="description" content="Enterprise Facility Management System - Asset Management, Maintenance, HSSE, and more" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { fontSize: '14px', borderRadius: '10px' },
        }}
      />
      <Component {...pageProps} />
    </ThemeProvider>
  )
}
