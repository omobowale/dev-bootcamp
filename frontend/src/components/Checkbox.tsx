import type { InputHTMLAttributes } from 'react';
import { Icon } from './Icon';
export function Checkbox(props: InputHTMLAttributes<HTMLInputElement>) {
  return <span className="modern-check"><input {...props} type="checkbox" /><span className="modern-check__box" aria-hidden="true"><Icon name="check" size={15} /></span></span>;
}
