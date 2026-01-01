import { useEffect, useState } from "react";
import { Bell, Save, Settings } from "lucide-react";
import { Button, Input } from "@/app/components/ui";
import { Spinner } from "@/app/components/ui/shared/SharedComponents";
import { getReminderSettings, updateReminderSettings } from "@/actions/reminders";

interface ReminderSettingsProps {
  userId: number;
}

const REMINDER_TYPES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "custom", label: "Custom" },
];

const DAYS_OF_WEEK = [
  { value: 0, label: "Monday" },
  { value: 1, label: "Tuesday" },
  { value: 2, label: "Wednesday" },
  { value: 3, label: "Thursday" },
  { value: 4, label: "Friday" },
  { value: 5, label: "Saturday" },
  { value: 6, label: "Sunday" },
];

const MOTIVATIONAL_MESSAGES = [
  "Keep tracking your expenses! 💚",
  "Time to log today's spending 📊",
  "Let's track those transactions! 🎯",
  "Budget check-in time! 💰",
  "Stay on top of your finances! 📈",
  "Your wallet thanks you! 🙏",
];

export function ReminderSettings({ userId }: ReminderSettingsProps) {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [form, setForm] = useState({
    isEnabled: true,
    reminderType: "daily",
    dayOfWeek: 0,
    reminderTime: "09:00",
    timesPerWeek: 3,
    motivationalMessage: "Keep tracking your expenses! 💚",
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await getReminderSettings(userId);
        setSettings(data);
        setForm({
          isEnabled: data.isEnabled,
          reminderType: data.reminderType,
          dayOfWeek: data.dayOfWeek || 0,
          reminderTime: data.reminderTime,
          timesPerWeek: data.timesPerWeek,
          motivationalMessage: data.motivationalMessage || "Keep tracking your expenses! 💚",
        });
      } catch (error) {
        console.error("Error loading reminder settings:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateReminderSettings(userId, form);
      setShowSettings(false);
      alert("Reminder settings saved!");
    } catch (error) {
      console.error("Error saving reminder settings:", error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="p-4 rounded-xl bg-primary-med shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Bell size={20} className="text-primary-magenta" />
          Reminder Settings
        </h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="px-3 py-1 rounded-md bg-primary-magenta text-white text-sm font-semibold"
        >
          {showSettings ? "Close" : <Settings size={16} />}
        </button>
      </div>

      {!showSettings && settings && (
        <div className="space-y-2 text-sm text-white-off">
          <div className="flex items-center justify-between p-3 bg-primary-blue rounded-lg">
            <span>Status</span>
            <span className={`font-bold ${form.isEnabled ? "text-green-light" : "text-red-accent"}`}>
              {form.isEnabled ? "Enabled" : "Disabled"}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-primary-blue rounded-lg">
            <span>Frequency</span>
            <span className="font-bold">{form.reminderType}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-primary-blue rounded-lg">
            <span>Reminder Time</span>
            <span className="font-bold">{form.reminderTime}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-primary-blue rounded-lg">
            <span>Times Per Week</span>
            <span className="font-bold">{form.timesPerWeek}x</span>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="p-4 bg-primary-blue rounded-lg space-y-4">
          {/* Enable/Disable */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold mb-2">
              <input
                type="checkbox"
                checked={form.isEnabled}
                onChange={(e) => setForm({ ...form, isEnabled: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              Enable Reminders
            </label>
          </div>

          {/* Reminder Type */}
          <div>
            <label className="block text-sm font-semibold mb-2">Reminder Type</label>
            <select
              value={form.reminderType}
              onChange={(e) => setForm({ ...form, reminderType: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-primary-dark text-white-off"
            >
              {REMINDER_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Day of Week (if weekly) */}
          {form.reminderType === "weekly" && (
            <div>
              <label className="block text-sm font-semibold mb-2">Day of Week</label>
              <select
                value={form.dayOfWeek}
                onChange={(e) => setForm({ ...form, dayOfWeek: parseInt(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-primary-dark text-white-off"
              >
                {DAYS_OF_WEEK.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Reminder Time */}
          <div>
            <label className="block text-sm font-semibold mb-2">Reminder Time</label>
            <Input
              type="time"
              value={form.reminderTime}
              onChange={(e) => setForm({ ...form, reminderTime: e.target.value })}
              className="bg-primary-dark text-white-off"
            />
          </div>

          {/* Times Per Week */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Upload Frequency: {form.timesPerWeek} times per week
            </label>
            <input
              type="range"
              min="1"
              max="7"
              value={form.timesPerWeek}
              onChange={(e) => setForm({ ...form, timesPerWeek: parseInt(e.target.value) })}
              className="w-full"
            />
            <p className="text-xs text-white-off opacity-70 mt-1">
              {form.timesPerWeek === 1
                ? "Once per week"
                : form.timesPerWeek === 7
                ? "Daily"
                : `${form.timesPerWeek} times per week`}
            </p>
          </div>

          {/* Motivational Message */}
          <div>
            <label className="block text-sm font-semibold mb-2">Motivational Message</label>
            <select
              value={form.motivationalMessage}
              onChange={(e) => setForm({ ...form, motivationalMessage: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-primary-dark text-white-off"
            >
              {MOTIVATIONAL_MESSAGES.map((msg) => (
                <option key={msg} value={msg}>
                  {msg}
                </option>
              ))}
            </select>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-primary-magenta text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            {saving ? <Spinner /> : <Save size={16} />}
            Save Settings
          </Button>
        </div>
      )}
    </div>
  );
}
