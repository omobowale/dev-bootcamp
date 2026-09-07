import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Select } from './Select';
import { Checkbox } from './Checkbox';
function Fixture() {
  const [value, setValue] = useState('');
  return <><label htmlFor="skill">Skill</label><Select id="skill" value={value} onChange={event => setValue(event.target.value)}><option value="">All skills</option><option value="react">React</option><option value="java">Java</option><option value="closed" disabled>Coming soon</option></Select><output data-testid="value">{value}</output><button>Next field</button></>;
}
describe('Searchable select', () => {
  it('filters options and selects a value using the keyboard', () => {
    render(<Fixture />);
    fireEvent.click(screen.getByRole('button', { name: 'Skill' }));
    const search = screen.getByRole('combobox');
    expect(search).toHaveFocus();
    fireEvent.change(search, { target: { value: 'rea' } });
    expect(screen.getAllByRole('option')).toHaveLength(1);
    fireEvent.keyDown(search, { key: 'Enter' });
    expect(screen.getByTestId('value')).toHaveTextContent('react');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Skill' })).toHaveFocus();
  });
  it('resets the selection and exposes a no-match state', () => {
    render(<Fixture />);
    fireEvent.click(screen.getByRole('button', { name: 'Skill' }));
    fireEvent.click(screen.getByRole('option', { name: 'React' }));
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect(screen.getByTestId('value')).toBeEmptyDOMElement();
    fireEvent.click(screen.getByRole('button', { name: 'Skill' }));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'zzzz' } });
    expect(screen.getByText(/no matches/i)).toBeInTheDocument();
  });
  it('closes on Escape and outside interaction without changing the selection', () => {
    render(<Fixture />);
    const trigger = screen.getByRole('button', { name: 'Skill' });
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' });
    expect(trigger).toHaveFocus();
    fireEvent.click(trigger);
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Next field' }));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.getByTestId('value')).toBeEmptyDOMElement();
  });
  it('does not select a disabled option', () => {
    render(<Fixture />); fireEvent.click(screen.getByRole('button', { name: 'Skill' }));
    fireEvent.click(screen.getByRole('option', { name: 'Coming soon' }));
    expect(screen.getByTestId('value')).toBeEmptyDOMElement();
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });
  it('keeps required selections part of form validity', () => {
    render(<form data-testid="form"><Select aria-label="Course" required value=""><option value="">Choose</option></Select></form>);
    expect((screen.getByTestId('form') as HTMLFormElement).checkValidity()).toBe(false);
  });
});
describe('Custom checkbox', () => {
  it('retains label activation and checked semantics', () => {
    const change = vi.fn();
    render(<label><Checkbox checked={false} onChange={change} />Publish profile</label>);
    fireEvent.click(screen.getByText('Publish profile'));
    expect(change).toHaveBeenCalledOnce();
    expect(screen.getByRole('checkbox', { name: 'Publish profile' })).not.toBeChecked();
  });
});
