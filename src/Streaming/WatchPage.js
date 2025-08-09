import React from 'react';
import HostStream from './HostStream';
import ViewerStream from './ViewerStream';

export default function WatchPage() {
  // Grab token from URL query, e.g., ?t=host-abc123 or ?t=view-xyz789
  const params = new URLSearchParams(window.location.search);
  const token = params.get('t');

  if (!token) return <div>No token provided.</div>;

  if (token.startsWith('host-')) {
    return <HostStream token={token} />;
  } else if (token.startsWith('view-')) {
    return <ViewerStream token={token} />;
  } else {
    return <div>Invalid token.</div>;
  }
}