import React from 'react';
import Link from 'next/link';

const NoScrollLink = React.forwardRef<HTMLAnchorElement, React.ComponentPropsWithRef<typeof Link>>(
  ({ children, ...props }, ref) => (
    <Link {...props} scroll={false} ref={ref}>
      {children}
    </Link>
  )
);

NoScrollLink.displayName = 'NoScrollLink';

export default NoScrollLink; 