import React from 'react';

// Layout is now a simple passthrough, as tabs are handled in App.tsx
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>{children}</div>
);

export default Layout;
