import React from 'react';
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left side — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white relative overflow-hidden">
        {/* Dot pattern background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="w-full max-w-2xl relative z-10">
          <Outlet />
        </div>
      </div>

      {/* Right side — Photographic workspace scene */}
      <div className="hidden lg:block flex-1 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80)',
            filter: 'blur(2px) brightness(0.95)',
          }}
        />
        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-black/5" />
      </div>
    </div>
  );
}
