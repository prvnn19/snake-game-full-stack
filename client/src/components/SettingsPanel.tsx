import type { GameSettings } from "../game/engine";

type SettingsPanelProps = {
  settings: GameSettings;
  playerName: string;
  onSettingsChange: (settings: GameSettings) => void;
  onPlayerNameChange: (name: string) => void;
};

const speedOptions = [
  { label: "Slow", value: 180 },
  { label: "Normal", value: 130 },
  { label: "Fast", value: 90 }
];

export function SettingsPanel({
  settings,
  playerName,
  onSettingsChange,
  onPlayerNameChange
}: SettingsPanelProps) {
  function updateDimension(field: "cols" | "rows", rawValue: string) {
    const value = Number(rawValue);

    if (!Number.isInteger(value)) {
      return;
    }

    const limitedValue = Math.min(Math.max(value, 10), 40);

    onSettingsChange({
      ...settings,
      [field]: limitedValue
    });
  }

  return (
    <aside className="settings-panel">
      <h2>Game settings</h2>

      <label>
        Player name
        <input
          type="text"
          value={playerName}
          maxLength={20}
          placeholder="Enter your name"
          onChange={(event) => onPlayerNameChange(event.target.value)}
        />
      </label>

      <label>
        Grid width
        <input
          type="number"
          min="10"
          max="40"
          value={settings.cols}
          onChange={(event) => updateDimension("cols", event.target.value)}
        />
      </label>

      <label>
        Grid height
        <input
          type="number"
          min="10"
          max="40"
          value={settings.rows}
          onChange={(event) => updateDimension("rows", event.target.value)}
        />
      </label>

      <label>
        Starting speed
        <select
          value={settings.baseSpeedMs}
          onChange={(event) =>
            onSettingsChange({
              ...settings,
              baseSpeedMs: Number(event.target.value)
            })
          }
        >
          {speedOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} ({option.value} ms)
            </option>
          ))}
        </select>
      </label>

      <p className="settings-note">
        Changing the settings will reset the current game.
      </p>
    </aside>
  );
}