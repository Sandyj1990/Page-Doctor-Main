# 🚀 Page Doctor Widget Integration Guide

## Overview

The Page Doctor Widget is a lightweight, embeddable component that brings website health checking capabilities to any web application, CMS, or platform. Perfect for Lovable projects, WordPress plugins, and custom dashboards.

## ✨ Features

- **🎯 Multiple Audit Types**: Single page, full website, or section-specific audits
- **🎨 Customizable Theming**: Light, dark, or auto themes with custom colors
- **📱 Responsive Design**: Works on desktop, tablet, and mobile
- **⚡ Real-time Progress**: Live progress updates during audits
- **🔒 Domain Security**: Optional domain allowlisting for secure integrations
- **🎛️ Flexible Sizing**: Compact or full-featured modes
- **📊 Rich Results**: Detailed scoring with actionable recommendations

## 🛠️ Installation

### Method 1: React Component (Recommended)

```bash
# Install the Page Doctor widget package
npm install @pagedoctor/widget

# Or copy the component files to your project
cp src/components/PageDoctorWidget.tsx your-project/components/
cp src/api/marketplace.ts your-project/api/
```

### Method 2: Standalone Script (Any Website)

```html
<!-- Add to your HTML head -->
<script src="https://cdn.pagedoctor.dev/widget/v1/page-doctor-widget.js"></script>
<link rel="stylesheet" href="https://cdn.pagedoctor.dev/widget/v1/page-doctor-widget.css">

<!-- Add widget container -->
<div id="page-doctor-widget"></div>

<!-- Initialize -->
<script>
PageDoctorWidget.init({
  containerId: 'page-doctor-widget',
  config: {
    theme: 'light',
    primaryColor: '#3b82f6',
    compact: false
  }
});
</script>
```

## 🎯 React Integration

### Basic Usage

```tsx
import React from 'react';
import { PageDoctorWidget } from '@pagedoctor/widget';

function App() {
  return (
    <div className="my-app">
      <h1>Website Health Dashboard</h1>
      
      <PageDoctorWidget
        defaultUrl="https://example.com"
        config={{
          theme: 'light',
          primaryColor: '#3b82f6',
          compact: false,
          showBranding: true
        }}
        onAuditComplete={(result) => {
          console.log('Audit completed:', result);
          // Send results to your analytics
        }}
        onError={(error) => {
          console.error('Audit failed:', error);
          // Handle errors gracefully
        }}
      />
    </div>
  );
}
```

### Advanced Configuration

```tsx
import { PageDoctorWidget, WidgetConfig } from '@pagedoctor/widget';

const config: WidgetConfig = {
  theme: 'auto', // 'light' | 'dark' | 'auto'
  primaryColor: '#10b981', // Custom brand color
  compact: true, // Smaller widget for sidebars
  showBranding: false, // Hide "Powered by Page Doctor"
  allowedDomains: ['yourdomain.com', 'app.yourdomain.com'], // Security
  apiKey: 'your-api-key' // For premium features
};

function CompactAuditWidget() {
  const handleAuditComplete = (result) => {
    // Custom result handling
    if (result.overallScore < 70) {
      showToast('Website needs optimization!', 'warning');
    } else {
      showToast('Great website health!', 'success');
    }
    
    // Save to your database
    saveAuditResult(result);
  };

  return (
    <PageDoctorWidget
      config={config}
      defaultUrl={getCurrentPageUrl()}
      onAuditComplete={handleAuditComplete}
      className="my-custom-widget-styles"
    />
  );
}
```

## 🌐 JavaScript/HTML Integration

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.pagedoctor.dev/widget/v1/page-doctor-widget.js"></script>
  <link rel="stylesheet" href="https://cdn.pagedoctor.dev/widget/v1/page-doctor-widget.css">
</head>
<body>
  <div id="audit-widget"></div>

  <script>
    // Initialize the widget
    const widget = new PageDoctorWidget({
      containerId: 'audit-widget',
      defaultUrl: window.location.href,
      config: {
        theme: 'light',
        primaryColor: '#3b82f6',
        compact: false
      },
      onAuditComplete: function(result) {
        console.log('Audit result:', result);
        // Update your UI with results
        updateDashboard(result);
      },
      onError: function(error) {
        console.error('Audit error:', error);
        showErrorMessage(error);
      }
    });

    // Programmatically run audit
    function runCustomAudit() {
      widget.runAudit({
        url: 'https://example.com',
        type: 'full',
        options: {
          useFastMode: true,
          maxPages: 20
        }
      });
    }
  </script>
</body>
</html>
```

### WordPress Plugin Integration

```php
<?php
// WordPress plugin example
class PageDoctorPlugin {
    public function __construct() {
        add_action('wp_enqueue_scripts', [$this, 'enqueue_scripts']);
        add_shortcode('page_doctor', [$this, 'render_widget']);
    }
    
    public function enqueue_scripts() {
        wp_enqueue_script(
            'page-doctor-widget',
            'https://cdn.pagedoctor.dev/widget/v1/page-doctor-widget.js',
            [],
            '1.0.0',
            true
        );
        
        wp_enqueue_style(
            'page-doctor-widget-styles',
            'https://cdn.pagedoctor.dev/widget/v1/page-doctor-widget.css',
            [],
            '1.0.0'
        );
    }
    
    public function render_widget($atts) {
        $atts = shortcode_atts([
            'url' => get_permalink(),
            'theme' => 'light',
            'color' => '#3b82f6',
            'compact' => 'false'
        ], $atts);
        
        $widget_id = 'page-doctor-' . uniqid();
        
        ob_start();
        ?>
        <div id="<?php echo $widget_id; ?>"></div>
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                new PageDoctorWidget({
                    containerId: '<?php echo $widget_id; ?>',
                    defaultUrl: '<?php echo esc_js($atts['url']); ?>',
                    config: {
                        theme: '<?php echo esc_js($atts['theme']); ?>',
                        primaryColor: '<?php echo esc_js($atts['color']); ?>',
                        compact: <?php echo $atts['compact'] === 'true' ? 'true' : 'false'; ?>
                    }
                });
            });
        </script>
        <?php
        return ob_get_clean();
    }
}

new PageDoctorPlugin();

// Usage in WordPress: [page_doctor url="https://example.com" theme="dark" compact="true"]
```

## 🎨 Theming and Customization

### Theme Options

```typescript
interface WidgetConfig {
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string; // Hex color code
  showBranding: boolean; // Show/hide "Powered by Page Doctor"
  compact: boolean; // Compact mode for smaller spaces
  allowedDomains: string[]; // Security whitelist
  apiKey?: string; // For premium features
}
```

### Custom CSS

```css
/* Override widget styles */
.page-doctor-widget {
  --primary-color: #10b981;
  --border-radius: 12px;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* Custom compact styling */
.page-doctor-widget.compact {
  max-width: 320px;
}

/* Dark theme customizations */
.page-doctor-widget.dark {
  --bg-color: #1f2937;
  --text-color: #f9fafb;
  --border-color: #374151;
}

/* Brand color overrides */
.page-doctor-widget .primary-button {
  background-color: var(--primary-color);
}

.page-doctor-widget .score-circle {
  color: var(--primary-color);
}
```

## 📊 API Reference

### Widget Props (React)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `config` | `WidgetConfig` | `{}` | Widget configuration |
| `defaultUrl` | `string` | `''` | Pre-filled URL |
| `onAuditComplete` | `(result: WidgetAuditResult) => void` | - | Callback when audit completes |
| `onError` | `(error: string) => void` | - | Callback when audit fails |
| `className` | `string` | `''` | Additional CSS classes |

### Audit Result Structure

```typescript
interface WidgetAuditResult {
  id: string;
  url: string;
  type: 'single' | 'full' | 'sections';
  overallScore: number; // 0-100
  categories: {
    writingQuality: number;
    seoSignals: number;
    structure: number;
    technical: number;
  };
  summary: {
    totalPages: number;
    completionTime: number; // milliseconds
    recommendations: string[];
  };
  detailed?: any; // Full audit data
  createdAt: string; // ISO timestamp
}
```

### JavaScript API Methods

```javascript
// Initialize widget
const widget = new PageDoctorWidget(options);

// Run audit programmatically
widget.runAudit({
  url: 'https://example.com',
  type: 'full',
  options: {
    useFastMode: true,
    maxPages: 15
  }
});

// Get widget status
const status = widget.getStatus();

// Update configuration
widget.updateConfig({
  theme: 'dark',
  primaryColor: '#ef4444'
});

// Reset widget
widget.reset();

// Destroy widget
widget.destroy();
```

## 🔒 Security Features

### Domain Allowlisting

```typescript
const config: WidgetConfig = {
  allowedDomains: [
    'yourdomain.com',
    'subdomain.yourdomain.com',
    'app.yourdomain.com'
  ]
};

// Only URLs from these domains can be audited
```

### API Key Authentication

```typescript
const config: WidgetConfig = {
  apiKey: 'pd_1234567890abcdef', // Your API key
  allowedDomains: ['yourdomain.com'] // Required with API key
};

// Enables premium features and higher rate limits
```

## 🎯 Use Cases

### 1. CMS Dashboard Integration

```typescript
// Add to admin dashboard
function AdminDashboard() {
  return (
    <div className="admin-panel">
      <h2>Website Health</h2>
      <PageDoctorWidget
        defaultUrl={siteUrl}
        config={{
          compact: true,
          theme: 'auto',
          showBranding: false
        }}
        onAuditComplete={(result) => {
          updateSiteHealthWidget(result);
          if (result.overallScore < 70) {
            showOptimizationNotification();
          }
        }}
      />
    </div>
  );
}
```

### 2. Client Portal Widget

```typescript
// Client-facing health dashboard
function ClientPortal({ clientDomain }) {
  return (
    <div className="client-dashboard">
      <PageDoctorWidget
        defaultUrl={`https://${clientDomain}`}
        config={{
          primaryColor: '#your-brand-color',
          allowedDomains: [clientDomain],
          compact: false
        }}
        onAuditComplete={(result) => {
          // Send to client analytics
          trackClientAudit(clientDomain, result);
        }}
      />
    </div>
  );
}
```

### 3. Marketing Tool Integration

```typescript
// Lead magnet with free audit
function LeadMagnetAudit() {
  return (
    <div className="lead-magnet">
      <h3>Get Your Free Website Health Report</h3>
      <PageDoctorWidget
        config={{
          compact: true,
          showBranding: true
        }}
        onAuditComplete={(result) => {
          // Capture lead
          if (result.overallScore < 80) {
            showConsultationOffer();
          }
          // Email report to user
          emailAuditReport(result);
        }}
      />
    </div>
  );
}
```

## 🚀 Performance Tips

1. **Lazy Loading**: Load the widget only when needed
2. **Caching**: Results are cached for 24 hours automatically
3. **Domain Limits**: Use `allowedDomains` to prevent abuse
4. **Fast Mode**: Enable `useFastMode` for quicker results
5. **Compact Mode**: Use compact mode in sidebars/smaller spaces

## 🆘 Troubleshooting

### Common Issues

**Widget not loading?**
- Check console for JavaScript errors
- Verify script URLs are correct
- Ensure container element exists

**CORS errors?**
- This is expected for cross-origin requests
- The widget handles CORS gracefully with fallbacks

**Slow audits?**
- Enable fast mode: `options: { useFastMode: true }`
- Reduce max pages: `options: { maxPages: 10 }`

**Styling issues?**
- Check CSS conflicts with your existing styles
- Use `!important` sparingly for overrides
- Test in different browsers

## 📞 Support

- **Documentation**: [docs.pagedoctor.dev](https://docs.pagedoctor.dev)
- **API Reference**: [api.pagedoctor.dev](https://api.pagedoctor.dev)
- **Support**: [support@pagedoctor.dev](mailto:support@pagedoctor.dev)
- **GitHub**: [github.com/pagedoctor/widget](https://github.com/pagedoctor/widget)

## 📄 License

MIT License - Free for commercial and personal use.

---

**Ready to integrate? Start with the basic example above and customize as needed!** 🚀 