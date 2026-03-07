import { Volume2, VolumeX } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useUISoundSettings } from '../../hooks/useUISoundSettings';

export default function UISoundControls() {
  const { enabled, volume, setEnabled, setVolume } = useUISoundSettings();

  return (
    <div className="space-y-4 p-4 bg-card/50 rounded-lg border border-border/50">
      <div className="flex items-center justify-between">
        <Label htmlFor="ui-sounds-toggle" className="text-sm font-medium">
          UI Sound Effects
        </Label>
        <Switch
          id="ui-sounds-toggle"
          checked={enabled}
          onCheckedChange={setEnabled}
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="ui-volume-slider" className="text-sm text-muted-foreground">
            UI Volume
          </Label>
          <span className="text-xs text-muted-foreground">
            {Math.round(volume * 100)}%
          </span>
        </div>
        <div className="flex items-center gap-3">
          {enabled ? (
            <Volume2 className="h-4 w-4 text-muted-foreground shrink-0" />
          ) : (
            <VolumeX className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
          <Slider
            id="ui-volume-slider"
            value={[volume]}
            onValueChange={([val]) => setVolume(val)}
            min={0}
            max={1}
            step={0.01}
            disabled={!enabled}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}
