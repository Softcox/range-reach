import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Identifier {
  id: string;
  category: 'range1' | 'range2';
  identifier_number: number;
  created_at: string;
}

export interface Item {
  id: string;
  identifier_id: string;
  name: string;
  unit_of_measurement: string;
  unit_price: number;
  identifier?: Identifier;
}

export interface Transaction {
  id: string;
  identifier_id: string;
  date: string;
  pods: number;
  sales: number;
  cancellations: number;
  status: 'pending' | 'arrived' | 'canceled';
  identifier?: Identifier;
}

export interface OpeningBalance {
  id: string;
  identifier_id: string;
  opening_quantity: number;
  opening_cost: number;
  identifier?: Identifier;
}

export interface Balance {
  identifier_id: string;
  identifier?: Identifier;
  current_quantity: number;
  current_cost: number;
}

export const useInventory = () => {
  const [identifiers, setIdentifiers] = useState<Identifier[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [openingBalances, setOpeningBalances] = useState<OpeningBalance[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIdentifiers = async () => {
    const { data, error } = await supabase
      .from('identifiers')
      .select('*')
      .order('category', { ascending: true })
      .order('identifier_number', { ascending: true });
    
    if (error) {
      toast({
        title: "Error fetching identifiers",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setIdentifiers(data || []);
    }
  };

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        identifier:identifiers(*)
      `)
      .order('name');
    
    if (error) {
      toast({
        title: "Error fetching items",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setItems(data || []);
    }
  };

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        identifier:identifiers(*)
      `)
      .order('date', { ascending: false });
    
    if (error) {
      toast({
        title: "Error fetching transactions",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setTransactions(data || []);
    }
  };

  const fetchOpeningBalances = async () => {
    const { data, error } = await supabase
      .from('opening_balances')
      .select(`
        *,
        identifier:identifiers(*)
      `);
    
    if (error) {
      toast({
        title: "Error fetching opening balances",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setOpeningBalances(data || []);
    }
  };

  const calculateBalances = () => {
    const balanceMap = new Map<string, Balance>();
    
    // Initialize with opening balances
    openingBalances.forEach(ob => {
      balanceMap.set(ob.identifier_id, {
        identifier_id: ob.identifier_id,
        identifier: ob.identifier,
        current_quantity: ob.opening_quantity,
        current_cost: ob.opening_cost,
      });
    });

    // Apply transactions
    transactions.forEach(transaction => {
      const current = balanceMap.get(transaction.identifier_id) || {
        identifier_id: transaction.identifier_id,
        identifier: transaction.identifier,
        current_quantity: 0,
        current_cost: 0,
      };

      if (transaction.status === 'arrived') {
        // Find the item to get unit price
        const item = items.find(i => i.identifier_id === transaction.identifier_id);
        const unitPrice = item?.unit_price || 0;
        
        current.current_quantity += transaction.pods;
        current.current_cost += transaction.pods * unitPrice;
      } else if (transaction.status === 'canceled') {
        current.current_quantity -= transaction.cancellations;
        // Proportionally reduce cost
        if (current.current_quantity > 0) {
          current.current_cost = current.current_cost * (current.current_quantity / (current.current_quantity + transaction.cancellations));
        } else {
          current.current_cost = 0;
        }
      }

      balanceMap.set(transaction.identifier_id, current);
    });

    setBalances(Array.from(balanceMap.values()));
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchIdentifiers(),
        fetchItems(),
        fetchTransactions(),
        fetchOpeningBalances(),
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    calculateBalances();
  }, [openingBalances, transactions, items]);

  const createIdentifier = async (category: 'range1' | 'range2', identifier_number: number) => {
    const { error } = await supabase
      .from('identifiers')
      .insert({
        category,
        identifier_number,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      });

    if (error) {
      toast({
        title: "Error creating identifier",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    await fetchIdentifiers();
    toast({
      title: "Success",
      description: "Identifier created successfully",
    });
    return true;
  };

  const createItem = async (item: Omit<Item, 'id' | 'identifier'>) => {
    const { error } = await supabase
      .from('items')
      .insert({
        ...item,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      });

    if (error) {
      toast({
        title: "Error creating item",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    await fetchItems();
    toast({
      title: "Success",
      description: "Item created successfully",
    });
    return true;
  };

  const createTransaction = async (transaction: Omit<Transaction, 'id' | 'identifier'>) => {
    const { error } = await supabase
      .from('transactions')
      .insert({
        ...transaction,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      });

    if (error) {
      toast({
        title: "Error creating transaction",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    await fetchTransactions();
    toast({
      title: "Success",
      description: "Transaction created successfully",
    });
    return true;
  };

  const updateOpeningBalance = async (identifier_id: string, opening_quantity: number, opening_cost: number) => {
    const { error } = await supabase
      .from('opening_balances')
      .upsert({
        identifier_id,
        opening_quantity,
        opening_cost,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      });

    if (error) {
      toast({
        title: "Error updating opening balance",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    await fetchOpeningBalances();
    toast({
      title: "Success",
      description: "Opening balance updated successfully",
    });
    return true;
  };

  return {
    identifiers,
    items,
    transactions,
    openingBalances,
    balances,
    loading,
    createIdentifier,
    createItem,
    createTransaction,
    updateOpeningBalance,
    refetch: {
      identifiers: fetchIdentifiers,
      items: fetchItems,
      transactions: fetchTransactions,
      openingBalances: fetchOpeningBalances,
    },
  };
};