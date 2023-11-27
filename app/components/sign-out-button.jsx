const SignOutButton = ({ supabase }) => {
  const handleSignOut = async () => {
    console.log('handleSignOut');
    await supabase.auth.signOut();
  };

  return (
    <button
      onClick={handleSignOut}
      className='flex grow text-sm px-3 py-2 rounded transition-colors duration-300 hover:bg-brand-surface-2'
    >
      <span className='font-medium'>Sign out</span>
    </button>
  );
};

export default SignOutButton;
