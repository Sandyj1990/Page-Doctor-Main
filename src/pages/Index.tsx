import { useState } from 'react';
import { AuditForm } from '@/components/AuditForm';
import { ReportCard } from '@/components/ReportCard';

const Index = () => {
  const [auditedUrl, setAuditedUrl] = useState<string | null>(null);

  const handleAuditComplete = (url: string) => {
    setAuditedUrl(url);
  };

  const handleBack = () => {
    setAuditedUrl(null);
  };

  if (auditedUrl) {
    return <ReportCard url={auditedUrl} onBack={handleBack} />;
  }

  return <AuditForm onAuditComplete={handleAuditComplete} />;
};

export default Index;
