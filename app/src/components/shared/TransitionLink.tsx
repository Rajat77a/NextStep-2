import { type ComponentProps } from 'react';
import { Link } from 'react-router-dom';
import { usePageTransition } from '@/contexts/PageTransitionContext';

type LinkProps = ComponentProps<typeof Link>;

export default function TransitionLink({ to, onClick, ...props }: LinkProps) {
  const { navigateWithTransition } = usePageTransition();

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (onClick) onClick(e);
    if (e.defaultPrevented) return;
    e.preventDefault();
    navigateWithTransition(to as string);
  }

  return <Link to={to} onClick={handleClick} {...props} />;
}
