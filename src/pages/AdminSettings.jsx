import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Settings,
  Shield,
  Users as UsersIcon,
  Database,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const ROLES = [
  'Admin',
  'Office/Dispatch',
  'Engineer (Field)',
  'Workshop Tech',
  'Driver',
  'H&S Manager',
  'Manager'
];

const MODULES = [
  'Jobs',
  'PPM',
  'Hire',
  'Fleet',
  'Internal Ops',
  'Dashboards',
  'Core Data',
  'Admin'
];

const DEFAULT_PERMISSIONS = {
  'Admin': {
    'Jobs': { view: true, create: true, edit: true, delete: true, scope: 'All' },
    'PPM': { view: true, create: true, edit: true, delete: true, scope: 'All' },
    'Hire': { view: true, create: true, edit: true, delete: true, scope: 'All' },
    'Fleet': { view: true, create: true, edit: true, delete: true, scope: 'All' },
    'Internal Ops': { view: true, create: true, edit: true, delete: true, scope: 'All' },
    'Dashboards': { view: true, create: true, edit: true, delete: true, scope: 'All' },
    'Core Data': { view: true, create: true, edit: true, delete: true, scope: 'All' },
    'Admin': { view: true, create: true, edit: true, delete: true, scope: 'All' }
  },
  'Office/Dispatch': {
    'Jobs': { view: true, create: true, edit: true, delete: false, scope: 'All' },
    'PPM': { view: true, create: true, edit: true, delete: false, scope: 'All' },
    'Hire': { view: true, create: true, edit: true, delete: false, scope: 'All' },
    'Fleet': { view: true, create: true, edit: true, delete: false, scope: 'All' },
    'Internal Ops': { view: true, create: false, edit: false, delete: false, scope: 'All' },
    'Dashboards': { view: true, create: false, edit: false, delete: false, scope: 'All' },
    'Core Data': { view: true, create: true, edit: true, delete: false, scope: 'All' },
    'Admin': { view: false, create: false, edit: false, delete: false, scope: 'None' }
  },
  'Engineer (Field)': {
    'Jobs': { view: true, create: false, edit: true, delete: false, scope: 'Assigned Only' },
    'PPM': { view: true, create: false, edit: true, delete: false, scope: 'Assigned Only' },
    'Hire': { view: false, create: false, edit: false, delete: false, scope: 'None' },
    'Fleet': { view: true, create: false, edit: true, delete: false, scope: 'Assigned Only' },
    'Internal Ops': { view: false, create: false, edit: false, delete: false, scope: 'None' },
    'Dashboards': { view: false, create: false, edit: false, delete: false, scope: 'None' },
    'Core Data': { view: true, create: false, edit: false, delete: false, scope: 'Read Only' },
    'Admin': { view: false, create: false, edit: false, delete: false, scope: 'None' }
  },
  'Workshop Tech': {
    'Jobs': { view: true, create: true, edit: true, delete: false, scope: 'Team Only' },
    'PPM': { view: true, create: false, edit: true, delete: false, scope: 'Team Only' },
    'Hire': { view: false, create: false, edit: false, delete: false, scope: 'None' },
    'Fleet': { view: true, create: false, edit: true, delete: false, scope: 'All' },
    'Internal Ops': { view: false, create: false, edit: false, delete: false, scope: 'None' },
    'Dashboards': { view: false, create: false, edit: false, delete: false, scope: 'None' },
    'Core Data': { view: true, create: false, edit: false, delete: false, scope: 'Read Only' },
    'Admin': { view: false, create: false, edit: false, delete: false, scope: 'None' }
  },
  'Driver': {
    'Jobs': { view: false, create: false, edit: false, delete: false, scope: 'None' },
    'PPM': { view: false, create: false, edit: false, delete: false, scope: 'None' },
    'Hire': { view: false, create: false, edit: false, delete: false, scope: 'None' },
    'Fleet': { view: true, create: false, edit: true, delete: false, scope: 'Assigned Only' },
    'Internal Ops': { view: false, create: false, edit: false, delete: false, scope: 'None' },
    'Dashboards': { view: false, create: false, edit: false, delete: false, scope: 'None' },
    'Core Data': { view: false, create: false, edit: false, delete: false, scope: 'None' },
    'Admin': { view: false, create: false, edit: false, delete: false, scope: 'None' }
  },
  'H&S Manager': {
    'Jobs': { view: true, create: false, edit: false, delete: false, scope: 'Read Only' },
    'PPM': { view: true, create: false, edit: false, delete: false, scope: 'Read Only' },
    'Hire': { view: true, create: false, edit: false, delete: false, scope: 'Read Only' },
    'Fleet': { view: true, create: false, edit: false, delete: false, scope: 'Read Only' },
    'Internal Ops': { view: true, create: true, edit: true, delete: true, scope: 'All' },
    'Dashboards': { view: true, create: false, edit: false, delete: false, scope: 'All' },
    'Core Data': { view: true, create: false, edit: false, delete: false, scope: 'Read Only' },
    'Admin': { view: false, create: false, edit: false, delete: false, scope: 'None' }
  },
  'Manager': {
    'Jobs': { view: true, create: false, edit: false, delete: false, scope: 'Read Only' },
    'PPM': { view: true, create: false, edit: false, delete: false, scope: 'Read Only' },
    'Hire': { view: true, create: false, edit: false, delete: false, scope: 'Read Only' },
    'Fleet': { view: true, create: false, edit: false, delete: false, scope: 'Read Only' },
    'Internal Ops': { view: true, create: false, edit: false, delete: false, scope: 'Read Only' },
    'Dashboards': { view: true, create: false, edit: false, delete: false, scope: 'All' },
    'Core Data': { view: true, create: false, edit: false, delete: false, scope: 'Read Only' },
    'Admin': { view: false, create: false, edit: false, delete: false, scope: 'None' }
  }
};

export default function AdminSettings() {
  const [selectedRole, setSelectedRole] = useState('Admin');

  const rolePermissions = DEFAULT_PERMISSIONS[selectedRole] || {};

  return (
    <div className="pb-8">
      <PageHeader
        title="Settings"
        subtitle="Manage roles and permissions"
      />

      <div className="px-4 sm:px-6 py-6 space-y-6">
        {/* Role Permissions Matrix */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role Permissions
            </CardTitle>
            <CardDescription>
              View and understand permission levels for each role
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Role Selector */}
            <div className="flex flex-wrap gap-2 mb-6">
              {ROLES.map(role => (
                <Button
                  key={role}
                  variant={selectedRole === role ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedRole(role)}
                >
                  {role}
                </Button>
              ))}
            </div>

            {/* Permissions Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Module</TableHead>
                    <TableHead className="text-center">View</TableHead>
                    <TableHead className="text-center">Create</TableHead>
                    <TableHead className="text-center">Edit</TableHead>
                    <TableHead className="text-center">Delete</TableHead>
                    <TableHead>Scope</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MODULES.map(module => {
                    const perms = rolePermissions[module] || {};
                    return (
                      <TableRow key={module}>
                        <TableCell className="font-medium">{module}</TableCell>
                        <TableCell className="text-center">
                          {perms.view ? (
                            <Check className="h-4 w-4 text-emerald-600 mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-slate-300 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {perms.create ? (
                            <Check className="h-4 w-4 text-emerald-600 mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-slate-300 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {perms.edit ? (
                            <Check className="h-4 w-4 text-emerald-600 mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-slate-300 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {perms.delete ? (
                            <Check className="h-4 w-4 text-emerald-600 mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-slate-300 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {perms.scope || 'None'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Role Descriptions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5" />
              Role Descriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-50">
                <h4 className="font-semibold text-red-700">Admin</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Full access to all modules and features. Can manage users, settings, and all operational data.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50">
                <h4 className="font-semibold text-blue-700">Office/Dispatch</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Can create, assign, and schedule jobs. Sees all operational data. Cannot delete or access admin settings.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50">
                <h4 className="font-semibold text-emerald-700">Engineer (Field)</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Sees only assigned jobs and items. Can update job progress, log time, and add photos. Limited to their assignments.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50">
                <h4 className="font-semibold text-amber-700">Workshop Tech</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Access to workshop jobs, asset checks, and parts/time logging. Can see team items.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50">
                <h4 className="font-semibold text-purple-700">Driver</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Access to vehicle checks, defects, and fuel logging. Sees only their assigned vehicle.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50">
                <h4 className="font-semibold text-pink-700">H&S Manager</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Full access to Internal Ops & Compliance. Read-only access to operational modules.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50">
                <h4 className="font-semibold text-slate-700">Manager</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Read-only access to dashboards and all lists. Cannot create, edit, or delete records.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}