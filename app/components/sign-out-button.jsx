const SignOutButton = ({ supabase }) => {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <button
      onClick={handleSignOut}
      className='flex grow text-sm text-brand-mid-gray px-3 py-2 rounded transition-colors duration-300 hover:text-brand-text hover:bg-brand-surface-2'
    >
      <span className='text-inherit'>Sign out</span>
    </button>
  );
};

export default SignOutButton;
