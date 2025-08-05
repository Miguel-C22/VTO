"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, CheckCircle, XCircle, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Message {
  type: 'success' | 'error';
  text: string;
  id: number;
}

interface Dealership {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  manufacturer?: string;
  website?: string;
  store_pin: number;
  created_at: string;
}

interface DealershipManagerProps {
  initialDealership: Dealership;
}

export function DealershipManager({ initialDealership }: DealershipManagerProps) {
  const [dealership, setDealership] = useState<Dealership>(initialDealership);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const supabase = createClient();

  // Message system
  const showMessage = (type: 'success' | 'error', text: string) => {
    const message: Message = { type, text, id: Date.now() };
    setMessages(prev => [...prev, message]);
    
    // Auto-remove message after 4 seconds
    setTimeout(() => {
      setMessages(prev => prev.filter(m => m.id !== message.id));
    }, 4000);
  };

  const removeMessage = (id: number) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  // Real-time subscription for dealership changes
  useEffect(() => {
    const channel = supabase
      .channel('dealership-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'dealerships',
          filter: `id=eq.${dealership.id}`
        },
        (payload) => {
          setDealership(payload.new as Dealership);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, dealership.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    // Store original data for rollback
    const originalDealership = { ...dealership };
    
    // Extract form data
    const updatedData = {
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      zip_code: formData.get('zip_code') as string,
      manufacturer: formData.get('manufacturer') as string,
      website: formData.get('website') as string,
      store_pin: parseInt(formData.get('store_pin') as string) || 0,
    };

    // Optimistic update
    setDealership(prev => ({ ...prev, ...updatedData }));

    try {
      const { error } = await supabase
        .from('dealerships')
        .update(updatedData)
        .eq('id', dealership.id);

      if (error) throw error;

      showMessage('success', 'Dealership information updated successfully');
    } catch (error) {
      console.error('Error updating dealership:', error);
      // Rollback optimistic update
      setDealership(originalDealership);
      showMessage('error', 'Failed to update dealership information');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Dealership, value: string | number) => {
    setDealership(prev => ({ ...prev, [field]: value }));
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

      {/* Dealership Information */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="h-5 w-5" />
          <div>
            <h2 className="text-xl font-semibold">Dealership Information</h2>
            <p className="text-muted-foreground">
              Basic information about your dealership
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* First Row - Name and Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Dealership Name</Label>
              <Input
                id="name"
                name="name"
                value={dealership.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={dealership.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                required
                className="w-full"
              />
            </div>
          </div>

          {/* Second Row - City, State, Zip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={dealership.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                value={dealership.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip_code">Zip Code</Label>
              <Input
                id="zip_code"
                name="zip_code"
                value={dealership.zip_code}
                onChange={(e) => handleInputChange('zip_code', e.target.value)}
                required
                className="w-full"
              />
            </div>
          </div>

          {/* Third Row - Manufacturer and Website */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                name="manufacturer"
                value={dealership.manufacturer || ''}
                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                placeholder="e.g., Toyota, Ford, BMW"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                value={dealership.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://www.example.com"
                className="w-full"
              />
            </div>
          </div>

          {/* Fourth Row - Store PIN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="store_pin">Store PIN</Label>
              <Input
                id="store_pin"
                name="store_pin"
                type="number"
                value={dealership.store_pin}
                onChange={(e) => handleInputChange('store_pin', parseInt(e.target.value) || 0)}
                placeholder="4-digit PIN for employee access"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Associates use this PIN to join your dealership
              </p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? "Saving Changes..." : "Save Changes"}
          </Button>
        </form>
      </div>
    </div>
  );
}