'use client';

// Next Js
import { useRouter } from 'next/navigation';

// Dependencies
import { SubmitHandler, useForm } from 'react-hook-form';

// Shadcn
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Components
import InputField from '@/components/forms/InputField';
import FooterLink from '@/components/forms/FooterLink';
import { signInWithEmail } from '@/lib/actions/auth.actions';

const SignIn = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
  });

  const onSubmit: SubmitHandler<SignInFormData> = async (data: SignInFormData) => {
    try {
      const res = await signInWithEmail(data);

      if (res.success) {
        toast.success('Signed in successfully');
        router.push('/');
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to sign in', {
        description: error instanceof Error ? error.message : 'Failed to sign in',
      });
    }
  };

  return (
    <>
      <h1 className="form-title">Welcome back</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <InputField name="email" label="Email" placeholder="contact@gmail.com" register={register} error={errors.email} validation={{ required: 'Email is required', pattern: /^\w+@\w+\.\w+$/ }} />
        <InputField name="password" label="Password" placeholder="Enter your password" type="password" register={register} error={errors.password} validation={{ required: 'Password is required', minLength: 8 }} />

        <Button type="submit" disabled={isSubmitting} className="yellow-btn mt-5 w-full">
          {isSubmitting ? 'Signing In' : 'Sign In'}
        </Button>

        <FooterLink text="Don't have an account?" linkText="Create an account" href="/sign-up" />
      </form>
    </>
  );
};
export default SignIn;
