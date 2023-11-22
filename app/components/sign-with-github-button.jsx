const SignInWithGitHub = ({ authRedirect, supabase, session }) => {
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (session) {
    return <button onClick={handleSignOut}>Sign out</button>;
  }

  return <button onClick={handleSignIn}>Sign in with GitHub</button>;
};

export default SignInWithGitHub;
