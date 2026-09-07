import { Children, isValidElement, useEffect, useId, useRef, useState, type ChangeEvent, type ReactNode, type SelectHTMLAttributes } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> & { onChange?: (event: ChangeEvent<HTMLSelectElement>) => void };
type Option = { value: string; label: string; disabled: boolean };
function text(node: ReactNode): string {
  return Children.toArray(node).map(child => isValidElement<{ children?: ReactNode }>(child) ? text(child.props.children) : String(child)).join('');
}
function optionsFrom(children: ReactNode): Option[] {
  return Children.toArray(children).flatMap(child => {
    if (!isValidElement<{ value?: string | number; children?: ReactNode; disabled?: boolean }>(child)) return [];
    return child.type === 'option' ? [{ value: String(child.props.value ?? text(child.props.children)), label: text(child.props.children), disabled: !!child.props.disabled }] : optionsFrom(child.props.children);
  });
}

/** Searchable listbox with native form events, keyboard navigation and a portalled panel. */
export function Select({ children, value, onChange, id, disabled, required, name, className = '', style, ...props }: Props) {
  const generated = useId();
  const fieldId = id || generated;
  const listId = `${fieldId}-options`;
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 240, maxHeight: 300 });
  const options = optionsFrom(children);
  const selected = options.find(option => option.value === String(value ?? ''));
  const filtered = options.filter(option => option.label.toLowerCase().includes(query.toLowerCase()));
  const empty = options.find(option => option.value === '');
  const label = props['aria-label'] || 'options';
  const close = (focus = true) => { setOpen(false); setQuery(''); if (focus) trigger.current?.focus(); };
  const choose = (option: Option) => {
    if (option.disabled) return;
    onChange?.({ target: { value: option.value, name, id: fieldId }, currentTarget: { value: option.value, name, id: fieldId } } as ChangeEvent<HTMLSelectElement>);
    close();
  };
  useEffect(() => {
    if (!open) return;
    const place = () => {
      const rect = trigger.current!.getBoundingClientRect();
      const below = window.innerHeight - rect.bottom - 12;
      const height = Math.min(340, Math.max(180, below >= 220 ? below : rect.top - 12));
      const width = Math.min(Math.max(rect.width, 260), window.innerWidth - 24);
      setPosition({ left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)), top: below >= 220 ? rect.bottom + 8 : Math.max(12, rect.top - height - 8), width, maxHeight: height });
    };
    place(); search.current?.focus();
    const outside = (event: PointerEvent) => { if (!panel.current?.contains(event.target as Node) && !trigger.current?.contains(event.target as Node)) close(false); };
    document.addEventListener('pointerdown', outside);
    window.addEventListener('resize', place); window.addEventListener('scroll', place, true);
    return () => { document.removeEventListener('pointerdown', outside); window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true); };
  }, [open]);
  return <span className={`smart-select ${className}`} style={style}>
    <button ref={trigger} id={fieldId} type="button" className="smart-select__trigger" disabled={disabled} aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? listId : undefined} aria-label={props['aria-label']} aria-required={required} aria-invalid={props['aria-invalid']} aria-describedby={props['aria-describedby']} onClick={() => { setOpen(!open); setActive(0); }} onKeyDown={event => { if (['ArrowDown', 'ArrowUp'].includes(event.key)) { event.preventDefault(); setOpen(true); setActive(0); } }}>
      <span>{selected?.label || 'Choose an option'}</span><Icon name="chevron" size={18} className={open ? 'is-open' : ''} />
    </button>
    {name && <input type="hidden" name={name} value={String(value ?? '')} />}
    {required && <input className="select-validity-input" tabIndex={-1} aria-hidden="true" value={String(value ?? '')} onChange={() => {}} required disabled={disabled} onInvalid={event => { event.preventDefault(); trigger.current?.focus(); setOpen(true); }} />}
    {empty && String(value ?? '') !== '' && !disabled && <button type="button" className="smart-select__reset" aria-label={`Reset ${String(label).trim()}`} onClick={() => choose(empty)}><Icon name="close" size={14} /></button>}
    {open && !disabled && createPortal(<div ref={panel} className="smart-select__panel" style={position} onKeyDown={event => {
      if (event.key === 'Escape') { event.preventDefault(); close(); }
      if (event.key === 'Tab') close();
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); const next = Math.max(0, Math.min(filtered.length - 1, active + (event.key === 'ArrowDown' ? 1 : -1))); setActive(next); document.getElementById(`${listId}-${next}`)?.scrollIntoView({ block: 'nearest' }); }
      if (event.key === 'Enter' && event.target === search.current) { event.preventDefault(); if (filtered[active]) choose(filtered[active]); }
    }}>
      <div className="smart-select__search"><Icon name="search" size={17} /><input ref={search} role="combobox" aria-expanded="true" aria-controls={listId} aria-autocomplete="list" aria-activedescendant={filtered[active] ? `${listId}-${active}` : undefined} aria-label={`Search ${String(label).trim()}`} placeholder="Type to find an option…" value={query} onChange={event => { setQuery(event.target.value); setActive(0); }} /><button type="button" className="icon-button" aria-label="Close options" onClick={() => close()}><Icon name="close" size={16} /></button></div>
      <div id={listId} role="listbox" aria-label={String(label).trim()} className="smart-select__options">{filtered.map((option, index) => <div key={option.value} id={`${listId}-${index}`} role="option" aria-selected={option.value === String(value ?? '')} aria-disabled={option.disabled} className={`smart-select__option ${index === active ? 'is-active' : ''}`} onPointerMove={() => setActive(index)} onMouseDown={event => event.preventDefault()} onClick={() => choose(option)}><span>{option.label}</span>{option.value === String(value ?? '') && <Icon name="check" size={17} />}</div>)}{!filtered.length && <p className="smart-select__empty">No matches. Try another search.</p>}</div>
      <div className="smart-select__hint">↑ ↓ to explore <span>Enter to select · Esc to close</span></div>
    </div>, document.body)}
  </span>;
}
