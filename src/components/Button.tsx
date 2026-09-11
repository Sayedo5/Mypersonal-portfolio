import React from 'react';

type Variant = 'primary' | 'outline' | 'ghost';

interface BaseProps {
  variant?: Variant;
  block?: boolean;
  className?: string;
  children: React.ReactNode;
  /** Trailing glyph, e.g. an arrow. Animates on hover. */
  icon?: string;
  iconDirection?: 'up-right' | 'down' | 'right';
}

const iconMotion: Record<NonNullable<BaseProps['iconDirection']>, string> = {
  'up-right': 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5',
  down: 'group-hover:translate-y-0.5',
  right: 'group-hover:translate-x-0.5',
};

function classes(variant: Variant, block: boolean, className: string) {
  return [
    'btn group',
    `btn-${variant}`,
    block ? 'btn-block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
}

function Icon({ icon, direction }: { icon: string; direction: NonNullable<BaseProps['iconDirection']> }) {
  return (
    <span
      aria-hidden="true"
      className={`text-[0.7rem] leading-none transition-transform duration-300 ${iconMotion[direction]}`}
    >
      {icon}
    </span>
  );
}

/** Anchor-styled call to action. */
export const ButtonLink: React.FC<
  BaseProps & React.AnchorHTMLAttributes<HTMLAnchorElement> & { external?: boolean }
> = ({
  variant = 'outline',
  block = false,
  className = '',
  children,
  icon,
  iconDirection = 'up-right',
  external = false,
  ...rest
}) => (
  <a
    className={classes(variant, block, className)}
    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    {...rest}
  >
    <span>{children}</span>
    {icon && <Icon icon={icon} direction={iconDirection} />}
  </a>
);

/** Real <button> for form submits and in-page actions. */
export const Button: React.FC<BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  variant = 'primary',
  block = false,
  className = '',
  children,
  icon,
  iconDirection = 'up-right',
  type = 'button',
  ...rest
}) => (
  <button type={type} className={classes(variant, block, className)} {...rest}>
    <span>{children}</span>
    {icon && <Icon icon={icon} direction={iconDirection} />}
  </button>
);

export default Button;
