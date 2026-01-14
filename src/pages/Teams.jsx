import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Plus,
  Users,
  Edit2,
  User,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';

export default function Teams() {
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', regionArea: '' });
  const [editTeam, setEditTeam] = useState(null);

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.filter({}, '-created_date')
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.EmployeeProfile.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Team.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setShowCreateDialog(false);
      setNewTeam({ name: '', regionArea: '' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Team.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setShowEditDialog(false);
      setEditTeam(null);
    }
  });

  const getMemberCount = (teamId) => {
    return employees.filter(e => e.team === teamId).length;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading teams..." />
      </div>
    );
  }

  return (
    <div className="pb-8">
      <PageHeader
        title="Teams"
        subtitle={`${teams.length} team${teams.length !== 1 ? 's' : ''}`}
        actions={
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4" />
                Add Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Team Name *</Label>
                  <Input
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                    placeholder="e.g. Field Engineers"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Region/Area</Label>
                  <Input
                    value={newTeam.regionArea}
                    onChange={(e) => setNewTeam({...newTeam, regionArea: e.target.value})}
                    placeholder="e.g. North Region"
                    className="mt-1.5"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                <Button onClick={() => createMutation.mutate(newTeam)} disabled={!newTeam.name}>
                  Create Team
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="px-4 sm:px-6 py-6">
        {teams.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No teams yet"
            description="Create teams to organize your workforce"
            action={() => setShowCreateDialog(true)}
            actionLabel="Create Team"
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map(team => {
              const memberCount = getMemberCount(team.id);
              const members = employees.filter(e => e.team === team.id).slice(0, 3);

              return (
                <Card key={team.id} className="hover:shadow-md transition-all">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{team.name}</CardTitle>
                          {team.regionArea && (
                            <p className="text-sm text-slate-500 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {team.regionArea}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => {
                          setEditTeam(team);
                          setShowEditDialog(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 mb-3">{memberCount} member{memberCount !== 1 ? 's' : ''}</p>
                    
                    {members.length > 0 && (
                      <div className="flex -space-x-2">
                        {members.map(member => (
                          <div
                            key={member.id}
                            className="h-8 w-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center"
                            title={member.displayName}
                          >
                            <User className="h-4 w-4 text-slate-500" />
                          </div>
                        ))}
                        {memberCount > 3 && (
                          <div className="h-8 w-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-medium text-slate-600">
                            +{memberCount - 3}
                          </div>
                        )}
                      </div>
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
            <DialogTitle>Edit Team</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Team Name</Label>
              <Input
                value={editTeam?.name || ''}
                onChange={(e) => setEditTeam({...editTeam, name: e.target.value})}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Region/Area</Label>
              <Input
                value={editTeam?.regionArea || ''}
                onChange={(e) => setEditTeam({...editTeam, regionArea: e.target.value})}
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={() => updateMutation.mutate({ id: editTeam.id, data: editTeam })}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}