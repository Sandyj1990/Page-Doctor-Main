/**
 * Widget Demo Page
 * 
 * Demonstrates the Page Doctor Widget in various configurations
 * for potential integrators and marketplace partners.
 */

import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Copy, ExternalLink, Settings, Palette, Monitor } from "lucide-react";
import { PageDoctorWidget } from '@/components/PageDoctorWidget';
import { WidgetAuditResult } from '@/api/marketplace';

export const WidgetDemo = () => {
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [isCompact, setIsCompact] = useState(false);
  const [showBranding, setShowBranding] = useState(true);
  const [lastResult, setLastResult] = useState<WidgetAuditResult | null>(null);

  const colorOptions = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Pink', value: '#ec4899' }
  ];

  const handleAuditComplete = (result: WidgetAuditResult) => {
    setLastResult(result);
    console.log('Demo audit completed:', result);
  };

  const handleError = (error: string) => {
    console.error('Demo audit error:', error);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // You could add a toast notification here
  };

  const reactCode = `import { PageDoctorWidget } from '@pagedoctor/widget';

function MyApp() {
  return (
    <PageDoctorWidget
      defaultUrl="https://example.com"
      config={{
        theme: '${selectedTheme}',
        primaryColor: '${selectedColor}',
        compact: ${isCompact},
        showBranding: ${showBranding}
      }}
      onAuditComplete={(result) => {
        console.log('Audit completed:', result);
      }}
      onError={(error) => {
        console.error('Audit failed:', error);
      }}
    />
  );
}`;

  const htmlCode = `<!-- Page Doctor Widget Integration -->
<div id="page-doctor-widget"></div>

<script src="https://cdn.pagedoctor.dev/widget/v1/page-doctor-widget.js"></script>
<link rel="stylesheet" href="https://cdn.pagedoctor.dev/widget/v1/page-doctor-widget.css">

<script>
PageDoctorWidget.init({
  containerId: 'page-doctor-widget',
  defaultUrl: 'https://example.com',
  config: {
    theme: '${selectedTheme}',
    primaryColor: '${selectedColor}',
    compact: ${isCompact},
    showBranding: ${showBranding}
  },
  onAuditComplete: function(result) {
    console.log('Audit result:', result);
  },
  onError: function(error) {
    console.error('Audit error:', error);
  }
});
</script>`;

  const wordpressCode = `// WordPress Shortcode Usage
[page_doctor url="https://example.com" theme="${selectedTheme}" color="${selectedColor}" compact="${isCompact}"]

// Or in PHP template
<?php echo do_shortcode('[page_doctor url="' . get_permalink() . '" theme="${selectedTheme}"]'); ?>`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Code className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Page Doctor Widget Demo</h1>
              <p className="text-xl text-muted-foreground">
                Embeddable website health checker for any platform
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4 text-sm">
            <Badge variant="secondary">React Component</Badge>
            <Badge variant="secondary">Vanilla JS</Badge>
            <Badge variant="secondary">WordPress Plugin</Badge>
            <Badge variant="secondary">CMS Integration</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Live Demo */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Monitor className="w-6 h-6" />
                  Live Demo
                </h2>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Interactive</Badge>
                  {lastResult && (
                    <Badge variant="default">
                      Score: {lastResult.overallScore}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Widget Demo */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                <PageDoctorWidget
                  defaultUrl="https://example.com"
                  config={{
                    theme: selectedTheme,
                    primaryColor: selectedColor,
                    compact: isCompact,
                    showBranding: showBranding
                  }}
                  onAuditComplete={handleAuditComplete}
                  onError={handleError}
                  className="max-w-none"
                />
              </div>
            </Card>

            {/* Code Examples */}
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Code className="w-6 h-6" />
                Integration Code
              </h2>

              <Tabs defaultValue="react" className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="react">React</TabsTrigger>
                  <TabsTrigger value="html">HTML/JS</TabsTrigger>
                  <TabsTrigger value="wordpress">WordPress</TabsTrigger>
                </TabsList>

                <TabsContent value="react" className="mt-6">
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{reactCode}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => copyCode(reactCode)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="html" className="mt-6">
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{htmlCode}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => copyCode(htmlCode)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="wordpress" className="mt-6">
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{wordpressCode}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => copyCode(wordpressCode)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Configuration Panel */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Widget Configuration
              </h3>

              <div className="space-y-6">
                {/* Theme Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Theme</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['light', 'dark', 'auto'] as const).map((theme) => (
                      <Button
                        key={theme}
                        variant={selectedTheme === theme ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTheme(theme)}
                        className="capitalize"
                      >
                        {theme}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Primary Color
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {colorOptions.map((color) => (
                      <Button
                        key={color.value}
                        variant={selectedColor === color.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedColor(color.value)}
                        className="flex items-center gap-2"
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color.value }}
                        />
                        {color.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Options</label>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Compact Mode</span>
                    <Button
                      variant={isCompact ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsCompact(!isCompact)}
                    >
                      {isCompact ? 'On' : 'Off'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Show Branding</span>
                    <Button
                      variant={showBranding ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowBranding(!showBranding)}
                    >
                      {showBranding ? 'On' : 'Off'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Features */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Key Features</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Multiple audit types</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Real-time progress updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Customizable theming</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Domain security controls</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Responsive design</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Zero external dependencies</span>
                </div>
              </div>
            </Card>

            {/* Documentation Link */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Documentation</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Complete integration guide with examples for React, JavaScript, WordPress, and more.
              </p>
              <Button className="w-full" variant="outline">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Full Documentation
              </Button>
            </Card>
          </div>
        </div>

        {/* Use Cases */}
        <Card className="p-8">
          <h2 className="text-2xl font-semibold mb-6 text-center">Perfect For</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                <Code className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold">Lovable Projects</h3>
              <p className="text-sm text-muted-foreground">
                Embed website health checking in your Lovable applications
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
                <Settings className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold">CMS Plugins</h3>
              <p className="text-sm text-muted-foreground">
                WordPress, Drupal, and other CMS dashboard integrations
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
                <Monitor className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold">Custom Dashboards</h3>
              <p className="text-sm text-muted-foreground">
                Client portals, admin panels, and marketing tools
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WidgetDemo; 