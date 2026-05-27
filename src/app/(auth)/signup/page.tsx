import type { Metadata } from 'next';
import { Suspense } from 'react';
import SignupPage from './SignupPage';

export const metadata: Metadata = { title: 'Sign Up' };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SignupPage />
    </Suspense>
  );
}
