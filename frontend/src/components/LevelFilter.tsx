import { Select } from "./Select";
import { COURSE_LEVELS } from "../constants/courseOptions";
import "./LevelFilter.css";

export function LevelFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (level: string) => void;
}) {
  return (
    <div className="level-filter">
      <label htmlFor="level-filter">Filter by level</label>
      <Select id="level-filter" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">All levels</option>
        {COURSE_LEVELS.map((level) => (
          <option key={level} value={level}>
            {level}
          </option>
        ))}
      </Select>
    </div>
  );
}
