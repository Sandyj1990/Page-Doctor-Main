import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, AlertTriangle } from "lucide-react";

interface ErrorDetail {
  message: string;
  location: string;
  severity: 'high' | 'medium' | 'low';
  suggestion: string;
  element?: string;
}

interface ErrorDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: ErrorDetail | null;
  title: string;
}

export const ErrorDetailModal = ({ isOpen, onClose, error, title }: ErrorDetailModalProps) => {
  if (!error) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant={getSeverityColor(error.severity) as any}>
              {error.severity.toUpperCase()} PRIORITY
            </Badge>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-medium mb-2 text-foreground">Error Description</h4>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
          
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
            <div>
              <h4 className="font-medium mb-1 text-foreground">Location</h4>
              <p className="text-sm text-muted-foreground">{error.location}</p>
              {error.element && (
                <code className="text-xs bg-muted px-2 py-1 rounded mt-2 block">
                  {error.element}
                </code>
              )}
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-medium mb-2 text-foreground">Suggested Fix</h4>
            <p className="text-sm text-muted-foreground">{error.suggestion}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};