'use server';

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
