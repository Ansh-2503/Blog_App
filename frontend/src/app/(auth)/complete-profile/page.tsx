import type { Metadata } from 'next';
import { CompleteProfileForm } from '@/components/auth/complete-profile-form';

export const metadata: Metadata = {
  title: 'Complete Profile',
  description: 'Complete your DevPulse profile.',
};

export default function CompleteProfilePage() {
  return <CompleteProfileForm />;
}
