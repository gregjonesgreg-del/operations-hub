import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Package, Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import HireAssetsList from '@/components/hire/HireAssetsList.jsx';
import HireContractsList from '@/components/hire/HireContractsList.jsx';

export default function Hire() {
  const { data: assets = [], isLoading: assetsLoading } = useQuery({
    queryKey: ['hireAssets'],
    queryFn: () => base44.entities.Asset.filter({ assetType: 'Hire Asset' })
  });

  const { data: contracts = [], isLoading: contractsLoading } = useQuery({
    queryKey: ['hireContracts'],
    queryFn: () => base44.entities.HireContract.list()
  });

  const available = assets.filter(a => a.availabilityStatus === 'Available').length;
  const onHire = assets.filter(a => a.availabilityStatus === 'On Hire').length;
  const activeContracts = contracts.filter(c => c.status === 'On Hire').length;

  if (assetsLoading || contractsLoading) {
    return <LoadingSpinner size="lg" text="Loading Hire..." />;
  }

  return (
    <div className="pb-8">
      <PageHeader
        title="Hire / Rental"
        subtitle={`${available} available • ${onHire} on hire • ${activeContracts} active contracts`}
        actions={
          <Link to={createPageUrl('CreateHireContract')}>
            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Contract</span>
            </Button>
          </Link>
        }
      />

      <div className="px-4 sm:px-6 py-6">
        <Tabs defaultValue="assets" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="assets" className="gap-2">
              <Package className="h-4 w-4" />
              Assets ({assets.length})
            </TabsTrigger>
            <TabsTrigger value="contracts" className="gap-2">
              <Calendar className="h-4 w-4" />
              Contracts ({contracts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assets" className="mt-6">
            <HireAssetsList assets={assets} />
          </TabsContent>

          <TabsContent value="contracts" className="mt-6">
            <HireContractsList contracts={contracts} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}