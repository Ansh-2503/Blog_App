import type { Metadata } from 'next';

import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = {
  title: 'Create account',
  description: 'Join DevPulse and start sharing engineering knowledge.',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
