'use client';

// Dependencies
import { useForm } from 'react-hook-form';

// Shadcn
import { Button } from '@/components/ui/button';

// Components
import InputField from '@/components/forms/InputField';
import FooterLink from '@/components/forms/FooterLink';

const SignIn = () => {
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

  const onSubmit = async (data: SignInFormData) => {
    try {
      console.log(data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <h1 className="form-title">Welcome back</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <InputField name="email" label="Email" placeholder="contact@jsmastery.com" register={register} error={errors.email} validation={{ required: 'Email is required', pattern: /^\w+@\w+\.\w+$/ }} />
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
