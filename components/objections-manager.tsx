"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, Check, X, CheckCircle, XCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface ObjectionChoice {
  id: number;
  description: string;
  is_active: boolean;
  dealership_id: string;
}

interface Message {
  type: 'success' | 'error';
  text: string;
  id: number;
}

interface ObjectionsManagerProps {
  initialChoices: ObjectionChoice[];
  dealershipId: string;
}

export function ObjectionsManager({
  initialChoices,
  dealershipId,
}: ObjectionsManagerProps) {
  const [choices, setChoices] = useState<ObjectionChoice[]>(initialChoices);
  const [newChoice, setNewChoice] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const supabase = createClient();

  const showMessage = (type: 'success' | 'error', text: string) => {
    const message: Message = { type, text, id: Date.now() };
    setMessages(prev => [...prev, message]);
    
    setTimeout(() => {
      setMessages(prev => prev.filter(m => m.id !== message.id));
    }, 4000);
  };

  const removeMessage = (id: number) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  useEffect(() => {
    const channel = supabase
      .channel("choices-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "choices",
          filter: `dealership_id=eq.${dealershipId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setChoices((prev) => {
              const exists = prev.find(choice => choice.id === payload.new.id);
              if (exists) {
                return prev;
              }
              return [...prev, payload.new as ObjectionChoice];
            });
          } else if (payload.eventType === "UPDATE") {
            setChoices((prev) =>
              prev.map((choice) =>
                choice.id === payload.new.id
                  ? (payload.new as ObjectionChoice)
                  : choice
              )
            );
          } else if (payload.eventType === "DELETE") {
            setChoices((prev) =>
              prev.filter((choice) => choice.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, dealershipId]);

  const handleAddChoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChoice.trim()) return;

    setLoading(true);
    const tempId = Date.now(); // Temporary ID - declare at function scope
    
    try {
      const existing = choices.find(
        (choice) =>
          choice.description.toLowerCase() === newChoice.trim().toLowerCase()
      );
      if (existing) {
        showMessage('error', "This objection reason already exists");
        setLoading(false);
        return;
      }

      const optimisticChoice: ObjectionChoice = {
        id: tempId,
        description: newChoice.trim(),
        dealership_id: dealershipId,
        is_active: true,
      };
      
      setChoices(prev => [...prev, optimisticChoice]);
      const choiceText = newChoice.trim();
      setNewChoice("");

      const { data, error } = await supabase
        .from("choices")
        .insert({
          description: choiceText,
          dealership_id: dealershipId,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      setChoices(prev => 
        prev.map(choice => 
          choice.id === tempId ? data : choice
        )
      );

      showMessage('success', "Objection reason added successfully");
    } catch (error) {
      console.error("Error adding choice:", error);
      setChoices(prev => prev.filter(choice => choice.id !== tempId));
      showMessage('error', "Failed to add objection reason");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateChoice = async (id: number, description: string) => {
    if (!description.trim()) return;

    const originalChoice = choices.find(choice => choice.id === id);
    if (!originalChoice) return;

    setChoices(prev =>
      prev.map(choice =>
        choice.id === id ? { ...choice, description: description.trim() } : choice
      )
    );
    setEditingId(null);
    setEditingText("");

    try {
      const { error } = await supabase
        .from("choices")
        .update({ description: description.trim() })
        .eq("id", id)
        .eq("dealership_id", dealershipId);

      if (error) throw error;

      showMessage('success', "Objection reason updated successfully");
    } catch (error) {
      console.error("Error updating choice:", error);
      setChoices(prev =>
        prev.map(choice =>
          choice.id === id ? originalChoice : choice
        )
      );
      setEditingId(id);
      setEditingText(originalChoice.description);
      showMessage('error', "Failed to update objection reason");
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    setChoices(prev =>
      prev.map(choice =>
        choice.id === id ? { ...choice, is_active: !currentStatus } : choice
      )
    );

    try {
      const { error } = await supabase
        .from("choices")
        .update({ is_active: !currentStatus })
        .eq("id", id)
        .eq("dealership_id", dealershipId);

      if (error) throw error;

      showMessage('success',
        `Objection reason ${!currentStatus ? "activated" : "deactivated"} successfully`
      );
    } catch (error) {
      console.error("Error toggling choice:", error);
      setChoices(prev =>
        prev.map(choice =>
          choice.id === id ? { ...choice, is_active: currentStatus } : choice
        )
      );
      showMessage('error', "Failed to toggle objection reason status");
    }
  };

  const handleDeleteChoice = async (id: number) => {
    if (!confirm("Are you sure you want to delete this objection reason?"))
      return;

    const originalChoice = choices.find(choice => choice.id === id);
    if (!originalChoice) return;

    setChoices(prev => prev.filter(choice => choice.id !== id));

    try {
      const { error } = await supabase
        .from("choices")
        .delete()
        .eq("id", id)
        .eq("dealership_id", dealershipId);

      if (error) throw error;

      showMessage('success', "Objection reason deleted successfully");
    } catch (error) {
      console.error("Error deleting choice:", error);
      setChoices(prev => [...prev, originalChoice]);
      showMessage('error', "Failed to delete objection reason");
    }
  };

  const startEditing = (choice: ObjectionChoice) => {
    setEditingId(choice.id);
    setEditingText(choice.description);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText("");
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
                message.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {message.type === 'success' ? (
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
      {/* Add Objection Reason */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Plus className="h-5 w-5" />
          <div>
            <h2 className="text-xl font-semibold">Add Objection Reason</h2>
            <p className="text-muted-foreground">
              Add a new objection reason for sales associates to choose from
            </p>
          </div>
        </div>

        <form onSubmit={handleAddChoice} className="flex gap-4">
          <Input
            value={newChoice}
            onChange={(e) => setNewChoice(e.target.value)}
            placeholder="Enter new objection reason"
            className="flex-1"
            disabled={loading}
          />
          <Button
            type="submit"
            disabled={loading || !newChoice.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? "Adding..." : "Add Reason"}
          </Button>
        </form>
      </div>

      {/* Manage Objection Reasons */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Edit className="h-5 w-5" />
          <div>
            <h2 className="text-xl font-semibold">Manage Objection Reasons</h2>
            <p className="text-muted-foreground">
              Edit, activate/deactivate, or delete existing objection reasons
            </p>
          </div>
        </div>

        {choices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No objection reasons created yet. Add your first one above.
          </div>
        ) : (
          <div className="space-y-4">
            {choices.map((choice) => (
              <div
                key={choice.id}
                className="bg-muted/30 border rounded-lg p-4"
              >
                {editingId === choice.id ? (
                  <div className="flex items-center gap-4">
                    <Input
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleUpdateChoice(choice.id, editingText)}
                      disabled={!editingText.trim()}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={cancelEditing}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="font-medium">{choice.description}</span>
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          choice.is_active
                            ? "bg-primary text-primary-foreground"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {choice.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing(choice)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={
                          choice.is_active
                            ? "text-orange-600 hover:text-orange-700"
                            : "text-green-600 hover:text-green-700"
                        }
                        onClick={() =>
                          handleToggleActive(choice.id, choice.is_active)
                        }
                      >
                        {choice.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive/80"
                        onClick={() => handleDeleteChoice(choice.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
