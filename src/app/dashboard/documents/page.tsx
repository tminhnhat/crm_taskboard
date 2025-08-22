'use client';

import { useState } from 'react';
import TaskForm from '@/components/TaskForm';
import TaskCard from '@/components/TaskCard';
import TaskFilters from '@/components/TaskFilters';
import { useSearchParams } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function DocumentsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Documents Management</h1>
        <p className="text-gray-600">
          Create and manage documents for customers, collaterals, and credit assessments.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Document Templates</h2>
            {/* Template list and upload functionality will go here */}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Generated Documents</h2>
            {/* Document list and generation functionality will go here */}
          </div>
        </div>
      )}
    </div>
  );
}
