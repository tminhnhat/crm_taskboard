'use client';

import React from 'react';
import Navigation from '@/components/Navigation';
import { TemplateManager } from '@/components/TemplateManager';

export default function TemplatesPage() {
  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <TemplateManager />
      </div>
    </>
  );
}