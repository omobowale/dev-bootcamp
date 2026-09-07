import { useTheme } from "../context/ThemeContext";
import { Icon, type IconName } from "./Icon";
import type { ThemePreference } from "../constants/theme";
import "./ThemeToggle.css";

const OPTIONS: { value: ThemePreference; icon: IconName; label: string }[] = [
  { value: "light", icon: "sun", label: "Light theme" },
  { value: "dark", icon: "moon", label: "Dark theme" },
  { value: "system", icon: "monitor", label: "Match system" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="theme-switch" role="radiogroup" aria-label="Color theme">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={theme === option.value}
          title={option.label}
          aria-label={option.label}
          className={`theme-switch__option${theme === option.value ? " is-active" : ""}`}
          onClick={() => setTheme(option.value)}
        >
          <Icon name={option.icon} size={15} />
        </button>
      ))}
    </div>
  );
}
