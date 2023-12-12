const SignInButton = ({ authRedirect, supabase }) => {
  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        redirectTo: authRedirect,
      },
    });
  };

  return (
    <button
      onClick={handleSignIn}
      className='flex items-center gap-3 px-4 py-2 rounded-lg bg-brand-pink hover:brightness-110 transition-all duration-300'
    >
      <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6' fill='currentColor' viewBox='0 0 24 24'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          d='M11.88,0.6C5.5,0.6,0.3,5.8,0.3,12.18c0,5.44,3.78,10.05,8.86,11.23c0-0.12-0.12-0.35-0.12-0.59V20.8c-0.47,0-1.3,0-1.42,0c-0.83,0-1.54-0.35-1.89-0.95c-0.35-0.71-0.47-1.77-1.42-2.48C4.08,17.14,4.2,16.9,4.55,16.9c0.59,0.12,1.06,0.59,1.54,1.18c0.47,0.59,0.71,0.71,1.54,0.71c0.47,0,1.06,0,1.65-0.12c0.35-0.83,0.83-1.54,1.54-1.89c-3.9-0.35-5.67-2.36-5.67-4.96c0-1.18,0.47-2.25,1.3-3.19c-0.35-0.59-0.71-2.48,0-3.19c1.77,0,2.84,1.18,3.07,1.42c0.83-0.35,1.77-0.47,2.84-0.47s2.01,0.12,2.84,0.47c0.24-0.35,1.3-1.42,3.07-1.42c0.71,0.71,0.35,2.6,0.12,3.55c0.83,0.95,1.3,2.01,1.3,3.07c0,2.6-1.89,4.49-5.67,4.96c1.06,0.59,1.89,2.13,1.89,3.31v2.6c0,0.12,0,0.12,0,0.24c4.49-1.54,7.8-5.91,7.8-10.99C23.46,5.8,18.26,0.6,11.88,0.6z'
        />
      </svg>
      <span className='font-medium'>Sign in with GitHub</span>
    </button>
  );
};

export default SignInButton;
