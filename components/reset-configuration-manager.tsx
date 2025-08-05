"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  RotateCcw,
  CheckCircle,
  XCircle,
  X,
  AlertTriangle,
} from "lucide-react";
import {
  updateResetConfigurationAction,
  executeManualResetAction,
} from "@/app/actions";

interface Message {
  type: "success" | "error";
  text: string;
  id: number;
}

interface ResetConfiguration {
  reset_type: string;
  reset_time: string;
  last_reset: string;
  created_at: string;
  updated_at: string;
}

interface ResetConfigurationManagerProps {
  initialConfig: ResetConfiguration;
  dealershipId: string;
}

// Convert database time format (HH:MM:SS) to dropdown format (HH:MM)
const getTimeForDropdown = (time: string) => {
  if (!time) return "12:00";
  // Handle both HH:MM and HH:MM:SS formats
  return time.length > 5 ? time.substring(0, 5) : time;
};

export function ResetConfigurationManager({
  initialConfig,
  dealershipId,
}: ResetConfigurationManagerProps) {
  const [config, setConfig] = useState<ResetConfiguration>(initialConfig);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  // Form state for controlled components
  const [selectedResetType, setSelectedResetType] = useState(config.reset_type);
  const [selectedResetTime, setSelectedResetTime] = useState(
    getTimeForDropdown(config.reset_time)
  );
  const [resetLoading, setResetLoading] = useState(false);

  // Message system
  const showMessage = (type: "success" | "error", text: string) => {
    const message: Message = { type, text, id: Date.now() };
    setMessages((prev) => [...prev, message]);

    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== message.id));
    }, 4000);
  };

  const removeMessage = (id: number) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Create form data with controlled values
    const formData = new FormData();
    formData.append("reset_type", selectedResetType);
    formData.append("reset_time", selectedResetTime);
    formData.append("dealershipId", dealershipId);

    try {
      const result = await updateResetConfigurationAction(formData);

      if (result.success) {
        showMessage("success", "Reset configuration updated successfully");
        // Update local state with new values
        const fullResetTime = selectedResetTime + ":00"; // Convert HH:MM to HH:MM:SS for display

        setConfig({
          ...config,
          reset_type: selectedResetType,
          reset_time: fullResetTime,
          updated_at: new Date().toISOString(),
        });
      } else {
        showMessage("error", result.error || "Failed to update configuration");
      }
    } catch (error) {
      console.error("Error updating reset configuration:", error);
      showMessage("error", "Failed to update configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleManualReset = async () => {
    const confirmed = confirm(
      "⚠️ WARNING: This will permanently delete ALL reports and submission data for your dealership.\n\n" +
        "This action cannot be undone. Are you absolutely sure you want to proceed?"
    );

    if (!confirmed) return;

    setResetLoading(true);

    try {
      const result = await executeManualResetAction(dealershipId);

      if (result.success) {
        showMessage(
          "success",
          "All reports have been reset successfully! Data has been cleared."
        );
        // Update the last reset date in config
        setConfig({
          ...config,
          last_reset: new Date().toISOString().split("T")[0], // Convert to YYYY-MM-DD format
          updated_at: new Date().toISOString(),
        });
      } else {
        showMessage("error", result.error || "Failed to reset reports");
      }
    } catch (error) {
      console.error("Error executing manual reset:", error);
      showMessage("error", "Failed to reset reports");
    } finally {
      setResetLoading(false);
    }
  };

  const formatResetTime = (time: string) => {
    // Handle both HH:MM and HH:MM:SS formats
    const timeParts = time.split(":");
    const hours = timeParts[0];
    const minutes = timeParts[1];
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const amPm = hour24 < 12 ? "AM" : "PM";
    return `${hour12}:${minutes} ${amPm} (${hour24 === 0 ? "Midnight" : hour24 === 12 ? "Noon" : hour24 + ":" + minutes})`;
  };

  const formatLastReset = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Messages */}
      {messages.length > 0 && (
        <div className="space-y-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                message.type === "success"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              <div className="flex items-center gap-2">
                {message.type === "success" ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <span>{message.text}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeMessage(message.id)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Report Reset Configuration */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <RotateCcw className="h-5 w-5" />
          <div>
            <h2 className="text-xl font-semibold">
              Report Reset Configuration
            </h2>
            <p className="text-muted-foreground">
              Configure how often all reports reset and start fresh
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Reset Type */}
          <div className="space-y-2">
            <Label htmlFor="reset_type">Reset Frequency</Label>
            <Select
              name="reset_type"
              value={selectedResetType}
              onValueChange={setSelectedResetType}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reset Time */}
          <div className="space-y-2">
            <Label htmlFor="reset_time">Reset Time (Hour of Day)</Label>
            <Select
              name="reset_time"
              value={selectedResetTime}
              onValueChange={setSelectedResetTime}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {Array.from({ length: 24 }, (_, i) => {
                  const hour = i.toString().padStart(2, "0");
                  const time = `${hour}:00`;
                  const hour12 = i === 0 ? 12 : i > 12 ? i - 12 : i;
                  const amPm = i < 12 ? "AM" : "PM";
                  const label = i === 0 ? "Midnight" : i === 12 ? "Noon" : "";

                  return (
                    <SelectItem key={time} value={time}>
                      {hour12}:00 {amPm}
                      {label && ` (${label})`}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Current Configuration Display */}
          <div className="mt-8 p-4 bg-muted/30 rounded-lg">
            <h3 className="font-medium mb-3">Current Configuration</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="font-medium">Reset Type:</span>{" "}
                {capitalizeFirst(config.reset_type)}
              </p>
              <p>
                <span className="font-medium">Reset Time:</span>{" "}
                {formatResetTime(config.reset_time)}
              </p>
              <p>
                <span className="font-medium">Last Reset:</span>{" "}
                {formatLastReset(config.last_reset)}
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? "Updating Reset Settings..." : "Update Reset Settings"}
          </Button>
        </form>
      </div>

      {/* Manual Reset Section */}
      <div className="bg-card border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <div>
            <h2 className="text-xl font-semibold text-red-900">Manual Reset</h2>
            <p className="text-red-700">
              Immediately reset all reports and clear submission data
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-medium text-red-900 mb-2">
              ⚠️ Warning: Permanent Action
            </h3>
            <p className="text-sm text-red-800 mb-3">
              This will permanently delete:
            </p>
            <ul className="text-sm text-red-800 space-y-1 mb-3">
              <li>• All objection submissions</li>
              <li>• User choice statistics</li>
              <li>• Historical report data</li>
            </ul>
            <p className="text-xs text-red-700">
              <strong>This action cannot be undone.</strong> Use this only when
              you want to start fresh with clean data.
            </p>
          </div>

          <Button
            onClick={handleManualReset}
            disabled={resetLoading}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {resetLoading ? (
              "Resetting All Data..."
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Reset All Reports Now
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
