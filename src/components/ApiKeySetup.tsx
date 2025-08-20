import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CrawleeService } from '@/services/crawleeService';

interface ApiKeySetupProps {
  onApiKeySet: () => void;
}

export const ApiKeySetup = ({ onApiKeySet }: ApiKeySetupProps) => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const handleValidateAndSave = async () => {
    if (!apiKey.trim()) {
      // Crawlee doesn't require API keys, so skip validation
      toast({
        title: "Crawlee Ready",
        description: "Using Crawlee for web crawling - no API key required!",
      });
      onApiKeySet();
      return;
    }

    setIsValidating(true);
    try {
      // Crawlee always validates successfully
      const isValid = await CrawleeService.testApiKey(apiKey);
      
      if (isValid) {
        CrawleeService.saveApiKey(apiKey);
        toast({
          title: "Crawlee Ready",
          description: "Local crawling setup completed successfully!",
        });
        onApiKeySet();
      } else {
        toast({
          variant: "destructive",
          title: "Setup Error",
          description: "Please try again.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Failed to validate API key. Please try again.",
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🕷️</span>
          Spider API Setup
        </CardTitle>
        <CardDescription>
          To crawl websites and audit multiple pages, please enter your Spider API key.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="apiKey" className="text-sm font-medium">
            Spider API Key
          </label>
          <Input
            id="apiKey"
            type="password"
            placeholder="Enter your Spider API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleValidateAndSave()}
          />
        </div>
        
        <Button 
          onClick={handleValidateAndSave} 
          className="w-full"
          disabled={isValidating}
        >
          {isValidating ? "Validating..." : "Validate & Save"}
        </Button>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Don't have a Spider API key?
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('https://spider.cloud', '_blank')}
          >
            Get API key from spider.cloud
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}