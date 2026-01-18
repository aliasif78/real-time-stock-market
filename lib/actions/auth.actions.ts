'use server';

import { headers } from 'next/headers';
import { inngest } from '../inngest/client';
import { auth } from '@/lib/better-auth/auth';

export const signUpWithEmail = async ({ email, password, fullName, country, investmentGoals, riskTolerance, preferredIndustry }: SignUpFormData) => {
  try {
    const res = await auth.api.signUpEmail({
      body: { email, password, name: fullName },
    });

    if (!res.user) return { success: false, error: 'Failed to sign up' };

    await inngest.send({
      name: 'app/user.created',
      data: { email, name: fullName, country, investmentGoals, riskTolerance, preferredIndustry },
    });

    return { success: true, data: res };
  } catch (error) {
    console.log(error);
    return { success: false, error: 'Failed to sign up' };
  }
};

export const signInWithEmail = async ({ email, password }: SignInFormData) => {
  try {
    const res = await auth.api.signInEmail({ body: { email, password } });
    if (!res.user) return { success: false, error: 'Failed to sign in' };
    return { success: true, data: res };
  } catch (error) {
    console.log(error);
    return { success: false, error: 'Failed to sign in' };
  }
};

export const signOut = async () => {
  try {
    await auth.api.signOut({ headers: await headers() });
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false };
  }
};
