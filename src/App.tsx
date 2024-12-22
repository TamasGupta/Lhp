import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { AuthForm } from './components/AuthForm';
import { FileUpload } from './components/FileUpload';
import { FileList } from './components/FileList';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/NavBar';

function App() {
  const [session, setSession] = useState<any>(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const { data: { subscription }, } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const isFileUploaded = (check: boolean | ((prevState: boolean) => boolean)) => {
    setFileUploaded(check);
  };

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        {!session ? (
          <div className="flex items-center justify-center min-h-screen">
            <AuthForm />
          </div>
        ) : (
          <div>
            <Navbar
              handleSignOut={handleSignOut}
              onThemeToggle={handleThemeToggle}
              isDarkMode={isDarkMode}
            />
            <div className="container mx-auto py-8 mt-2">
              <div className="space-y-8">
                <FileUpload isFileuploaded={isFileUploaded} />
                <FileList fileUploaded={fileUploaded} isdarkMode={isDarkMode} />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;


