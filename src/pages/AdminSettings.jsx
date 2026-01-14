import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminSettings() {
  return (
    <div className="pb-8">
      <PageHeader title="Admin Settings" />
      <div className="px-4 sm:px-6 py-6">
        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">Settings panel coming soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}