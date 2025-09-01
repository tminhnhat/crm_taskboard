'use client';

import React from 'react';
import Navigation from '@/components/Navigation';
import { TemplateManager } from '@/components/TemplateManager';

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navigation />
      <TemplateManager />
    </div>
  );
}