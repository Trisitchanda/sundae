import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const AuthLayout = () => {
  const { user, isLoading } = useSelector(state => state.auth);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-cream text-ink font-serif">Loading...</div>;
  }

  if (user) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="min-h-screen bg-cream text-ink flex selection:bg-yellow selection:text-ink">
      
      {/* Left side: Editorial Brand */}
      <div className="hidden lg:flex w-1/2 bg-ink text-cream flex-col justify-between p-12 lg:p-24 relative overflow-hidden">
        {/* Abstract typography decor */}
        <div className="absolute -left-24 top-1/4 opacity-10 select-none pointer-events-none">
           <h1 className="font-serif text-[24rem] leading-none tracking-tighter text-yellow">M.</h1>
        </div>

        <div className="relative z-10">
          <Link to="/" className="font-serif text-3xl tracking-tight hover:opacity-70 transition-opacity inline-block interactive">
            Sundae
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="font-serif text-5xl md:text-7xl leading-[1.1] mb-6">
            Your money,<br/>but clearer.
          </h2>
          <p className="text-xl text-olive font-light leading-relaxed">
            Personal finance without the noise. 
            A beautiful instrument for tracking your capital with intention.
          </p>
        </div>
      </div>

      {/* Right side: Distraction-free Auth */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative">
        <Link to="/" className="lg:hidden absolute top-8 left-8 font-serif text-2xl tracking-tight interactive">
          Sundae
        </Link>
        
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
