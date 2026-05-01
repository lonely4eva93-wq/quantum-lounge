import { useGetSettings, useUpdateSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Save, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

export default function OwnerSettings() {
  const { data: settings, isLoading } = useGetSettings();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    loungeName: "",
    tagline: "",
    houseFee: 0,
    ownerName: "",
    theme: "",
    isOpen: true
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        loungeName: settings.loungeName,
        tagline: settings.tagline,
        houseFee: settings.houseFee,
        ownerName: settings.ownerName,
        theme: settings.theme,
        isOpen: settings.isOpen
      });
    }
  }, [settings]);

  const updateSettings = useUpdateSettings({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
        toast({
          title: "Parameters Updated",
          description: "Global system settings reconfigured successfully.",
        });
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate({ data: formData });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold uppercase tracking-widest text-white mb-2 flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-primary" /> System Parameters
          </h1>
          <p className="text-muted-foreground font-mono">Global configuration for the Quantum Lounge.</p>
        </div>
      </div>

      <Card className="p-8 bg-card/40 border-primary/20 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h2 className="text-xl font-display font-bold uppercase tracking-wider text-white border-b border-white/10 pb-2">
                Identity Core
              </h2>
              
              <div className="space-y-2">
                <label className="text-xs font-mono text-primary/70 uppercase tracking-widest">Lounge Designation</label>
                <Input
                  value={formData.loungeName}
                  onChange={(e) => setFormData(prev => ({ ...prev, loungeName: e.target.value }))}
                  className="bg-black/50 border-primary/30 focus:border-primary font-mono text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-primary/70 uppercase tracking-widest">Transmission Tagline</label>
                <Input
                  value={formData.tagline}
                  onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                  className="bg-black/50 border-primary/30 focus:border-primary font-mono text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-primary/70 uppercase tracking-widest">Owner Alias</label>
                <Input
                  value={formData.ownerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                  className="bg-black/50 border-primary/30 focus:border-primary font-mono text-white"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-display font-bold uppercase tracking-wider text-white border-b border-white/10 pb-2">
                Operational Metrics
              </h2>

              <div className="space-y-2">
                <label className="text-xs font-mono text-primary/70 uppercase tracking-widest">Base Entry Fee (¤)</label>
                <Input
                  type="number"
                  value={formData.houseFee}
                  onChange={(e) => setFormData(prev => ({ ...prev, houseFee: Number(e.target.value) }))}
                  className="bg-black/50 border-primary/30 focus:border-primary font-mono text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-primary/70 uppercase tracking-widest">Global Theme / Vibe</label>
                <Input
                  value={formData.theme}
                  onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
                  className="bg-black/50 border-primary/30 focus:border-primary font-mono text-white"
                />
              </div>

              <div className="pt-4 flex items-center justify-between p-4 rounded-lg bg-black/30 border border-primary/20">
                <div>
                  <div className="font-bold text-white font-mono uppercase tracking-widest mb-1">Lounge Status</div>
                  <div className="text-xs text-muted-foreground font-mono">Toggle global access to the lounge.</div>
                </div>
                <Switch
                  checked={formData.isOpen}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isOpen: checked }))}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex justify-end">
            <Button
              type="submit"
              disabled={updateSettings.isPending}
              className="bg-primary/20 text-primary border border-primary hover:bg-primary hover:text-black font-display uppercase tracking-widest min-w-[200px]"
            >
              {updateSettings.isPending ? "Reconfiguring..." : <><Save className="w-4 h-4 mr-2" /> Save Parameters</>}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
