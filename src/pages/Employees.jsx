import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Plus,
  User,
  Search,
  Phone,
  Mail,
  Users,
  Edit2,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';

const ROLES = [
  'Admin',
  'Office/Dispatch',
  'Engineer (Field)',
  'Workshop Tech',
  'Driver',
  'H&S Manager',
  'Manager'
];

const roleColors = {
  'Admin': 'bg-red-100 text-red-700',
  'Office/Dispatch': 'bg-blue-100 text-blue-700',
  'Engineer (Field)': 'bg-emerald-100 text-emerald-700',
  'Workshop Tech': 'bg-amber-100 text-amber-700',
  'Driver': 'bg-purple-100 text-purple-700',
  'H&S Manager': 'bg-pink-100 text-pink-700',
  'Manager': 'bg-slate-100 text-slate-700'
};

export default function Employees() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    displayName: '',
    role: 'Engineer (Field)',
    team: '',
    phone: '',
    email: '',
    isActive: true
  });
  const [editEmployee, setEditEmployee] = useState(null);

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.EmployeeProfile.filter({}, '-created_date')
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list()
  });

  const teamMap = useMemo(() => teams.reduce((acc, t) => ({ ...acc, [t.id]: t }), {}), [teams]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.EmployeeProfile.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setShowCreateDialog(false);
      setNewEmployee({
        displayName: '',
        role: 'Engineer (Field)',
        team: '',
        phone: '',
        email: '',
        isActive: true
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.EmployeeProfile.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setShowEditDialog(false);
      setEditEmployee(null);
    }
  });

  const filteredEmployees = employees.filter(e => 
    e.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading employees..." />
      </div>
    );
  }

  return (
    <div className="pb-8">
      <PageHeader
        title="Employees"
        subtitle={`${filteredEmployees.length} employee${filteredEmployees.length !== 1 ? 's' : ''}`}
        actions={
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Employee Profile</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Display Name *</Label>
                  <Input
                    value={newEmployee.displayName}
                    onChange={(e) => setNewEmployee({...newEmployee, displayName: e.target.value})}
                    placeholder="Full name"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Role *</Label>
                  <Select value={newEmployee.role} onValueChange={(v) => setNewEmployee({...newEmployee, role: v})}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Team</Label>
                  <Select value={newEmployee.team} onValueChange={(v) => setNewEmployee({...newEmployee, team: v})}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>No team</SelectItem>
                      {teams.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={newEmployee.phone}
                      onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                <Button 
                  onClick={() => createMutation.mutate(newEmployee)} 
                  disabled={!newEmployee.displayName || !newEmployee.role}
                >
                  Add Employee
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      >
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </PageHeader>

      <div className="px-4 sm:px-6 py-6">
        {filteredEmployees.length === 0 ? (
          <EmptyState
            icon={User}
            title="No employees found"
            description={searchQuery ? "Try a different search term" : "Add employee profiles to get started"}
            action={searchQuery ? () => setSearchQuery('') : () => setShowCreateDialog(true)}
            actionLabel={searchQuery ? "Clear Search" : "Add Employee"}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map(employee => {
              const team = teamMap[employee.team];

              return (
                <Card key={employee.id} className={cn(
                  "hover:shadow-md transition-all",
                  !employee.isActive && "opacity-60"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center">
                          <User className="h-6 w-6 text-slate-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{employee.displayName}</h3>
                          <Badge className={cn("text-xs mt-1", roleColors[employee.role] || 'bg-slate-100 text-slate-700')}>
                            {employee.role}
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => {
                          setEditEmployee(employee);
                          setShowEditDialog(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                      {team && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Users className="h-4 w-4" />
                          {team.name}
                        </div>
                      )}
                      {employee.phone && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="h-4 w-4" />
                          <a href={`tel:${employee.phone}`} className="hover:text-indigo-600">
                            {employee.phone}
                          </a>
                        </div>
                      )}
                      {employee.email && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail className="h-4 w-4" />
                          <a href={`mailto:${employee.email}`} className="hover:text-indigo-600 truncate">
                            {employee.email}
                          </a>
                        </div>
                      )}
                    </div>

                    {!employee.isActive && (
                      <Badge variant="secondary" className="mt-3">Inactive</Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Display Name</Label>
              <Input
                value={editEmployee?.displayName || ''}
                onChange={(e) => setEditEmployee({...editEmployee, displayName: e.target.value})}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select 
                value={editEmployee?.role || ''} 
                onValueChange={(v) => setEditEmployee({...editEmployee, role: v})}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Team</Label>
              <Select 
                value={editEmployee?.team || ''} 
                onValueChange={(v) => setEditEmployee({...editEmployee, team: v})}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>No team</SelectItem>
                  {teams.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input
                  value={editEmployee?.phone || ''}
                  onChange={(e) => setEditEmployee({...editEmployee, phone: e.target.value})}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={editEmployee?.email || ''}
                  onChange={(e) => setEditEmployee({...editEmployee, email: e.target.value})}
                  className="mt-1.5"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={editEmployee?.isActive ?? true}
                onChange={(e) => setEditEmployee({...editEmployee, isActive: e.target.checked})}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={() => updateMutation.mutate({ id: editEmployee.id, data: editEmployee })}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}