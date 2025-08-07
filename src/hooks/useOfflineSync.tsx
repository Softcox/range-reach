import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface OfflineTransaction {
  id: string;
  data: any;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  timestamp: number;
}

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState<OfflineTransaction[]>([]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingTransactions();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Offline Mode",
        description: "You're working offline. Changes will sync when reconnected.",
        variant: "default",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load pending transactions from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('pendingSyncTransactions');
    if (stored) {
      try {
        setPendingSync(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading pending transactions:', error);
      }
    }
  }, []);

  // Save pending transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('pendingSyncTransactions', JSON.stringify(pendingSync));
  }, [pendingSync]);

  const addPendingTransaction = (
    table: string,
    operation: 'insert' | 'update' | 'delete',
    data: any
  ) => {
    const transaction: OfflineTransaction = {
      id: crypto.randomUUID(),
      table,
      operation,
      data,
      timestamp: Date.now(),
    };

    setPendingSync(prev => [...prev, transaction]);

    if (!isOnline) {
      toast({
        title: "Saved Offline",
        description: "Changes saved locally and will sync when online.",
      });
    }
  };

  const syncPendingTransactions = async () => {
    if (pendingSync.length === 0) return;

    try {
      for (const transaction of pendingSync) {
        await syncSingleTransaction(transaction);
      }

      setPendingSync([]);
      toast({
        title: "Sync Complete",
        description: `${pendingSync.length} changes synced successfully.`,
      });
    } catch (error) {
      console.error('Sync failed:', error);
      toast({
        title: "Sync Failed",
        description: "Some changes couldn't be synced. Will retry later.",
        variant: "destructive",
      });
    }
  };

  const syncSingleTransaction = async (transaction: OfflineTransaction) => {
    const { table, operation, data } = transaction;

    // Only sync allowed tables
    if (!['transactions', 'items', 'identifiers', 'opening_balances'].includes(table)) {
      return;
    }

    switch (operation) {
      case 'insert':
        const { error: insertError } = await supabase
          .from(table as any)
          .insert(data);
        if (insertError) throw insertError;
        break;

      case 'update':
        const { error: updateError } = await supabase
          .from(table as any)
          .update(data)
          .eq('id', data.id);
        if (updateError) throw updateError;
        break;

      case 'delete':
        const { error: deleteError } = await supabase
          .from(table as any)
          .delete()
          .eq('id', data.id);
        if (deleteError) throw deleteError;
        break;

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  };

  const clearPendingTransactions = () => {
    setPendingSync([]);
    localStorage.removeItem('pendingSyncTransactions');
  };

  return {
    isOnline,
    pendingSync,
    addPendingTransaction,
    syncPendingTransactions,
    clearPendingTransactions,
    hasPendingChanges: pendingSync.length > 0,
  };
};