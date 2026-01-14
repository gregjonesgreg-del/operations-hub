import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '../utils';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Building2, 
  MapPin, 
  Package, 
  Wrench,
  User,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const entityConfig = {
  Customer: { icon: Building2, color: 'text-blue-600 bg-blue-50', page: 'CustomerDetail' },
  Site: { icon: MapPin, color: 'text-emerald-600 bg-emerald-50', page: 'SiteDetail' },
  Asset: { icon: Package, color: 'text-purple-600 bg-purple-50', page: 'AssetDetail' },
  Job: { icon: Wrench, color: 'text-amber-600 bg-amber-50', page: 'JobDetail' },
  Contact: { icon: User, color: 'text-pink-600 bg-pink-50', page: 'ContactDetail' }
};

export default function GlobalSearch({ open, onOpenChange }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setLoading(true);
      try {
        const searchResults = [];
        
        // Search customers
        const customers = await base44.entities.Customer.filter({}, '-created_date', 100);
        const matchedCustomers = customers.filter(c => 
          c.name?.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 3);
        matchedCustomers.forEach(c => searchResults.push({
          type: 'Customer',
          id: c.id,
          title: c.name,
          subtitle: c.billingAddress
        }));

        // Search sites
        const sites = await base44.entities.Site.filter({}, '-created_date', 100);
        const matchedSites = sites.filter(s => 
          s.siteName?.toLowerCase().includes(query.toLowerCase()) ||
          s.address?.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 3);
        matchedSites.forEach(s => searchResults.push({
          type: 'Site',
          id: s.id,
          title: s.siteName,
          subtitle: s.address
        }));

        // Search assets
        const assets = await base44.entities.Asset.filter({}, '-created_date', 100);
        const matchedAssets = assets.filter(a => 
          a.internalAssetId?.toLowerCase().includes(query.toLowerCase()) ||
          a.make?.toLowerCase().includes(query.toLowerCase()) ||
          a.model?.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 3);
        matchedAssets.forEach(a => searchResults.push({
          type: 'Asset',
          id: a.id,
          title: `${a.make} ${a.model}`,
          subtitle: a.internalAssetId
        }));

        // Search jobs
        const jobs = await base44.entities.Job.filter({}, '-created_date', 100);
        const matchedJobs = jobs.filter(j => 
          j.jobNumber?.toLowerCase().includes(query.toLowerCase()) ||
          j.description?.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 3);
        matchedJobs.forEach(j => searchResults.push({
          type: 'Job',
          id: j.id,
          title: j.jobNumber || 'Job',
          subtitle: j.description?.substring(0, 50)
        }));

        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const handleSelect = (result) => {
    const config = entityConfig[result.type];
    navigate(createPageUrl(config.page) + `?id=${result.id}`);
    onOpenChange(false);
    setQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 gap-0">
        <div className="flex items-center gap-3 px-4 border-b">
          <Search className="h-5 w-5 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customers, sites, assets, jobs..."
            className="border-0 focus-visible:ring-0 text-base py-4"
            autoFocus
          />
          {loading && <Loader2 className="h-5 w-5 animate-spin text-slate-400" />}
        </div>

        {results.length > 0 && (
          <div className="max-h-96 overflow-auto p-2">
            {results.map((result, idx) => {
              const config = entityConfig[result.type];
              const Icon = config.icon;

              return (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSelect(result)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
                >
                  <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", config.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{result.title}</p>
                    <p className="text-sm text-slate-500 truncate">{result.subtitle}</p>
                  </div>
                  <span className="text-xs text-slate-400 uppercase">{result.type}</span>
                </button>
              );
            })}
          </div>
        )}

        {query.length >= 2 && !loading && results.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            No results found for "{query}"
          </div>
        )}

        {query.length < 2 && (
          <div className="p-8 text-center text-slate-400 text-sm">
            Start typing to search...
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}