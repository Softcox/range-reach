import { useState } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const Transactions = () => {
  const { identifiers, transactions, loading, createTransaction } = useInventory();
  const { isAdmin } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    identifier_id: '',
    date: new Date().toISOString().split('T')[0],
    pods: 0,
    sales: 0,
    cancellations: 0,
    status: 'pending' as 'pending' | 'arrived' | 'canceled',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await createTransaction(formData);
    if (success) {
      setIsDialogOpen(false);
      setFormData({
        identifier_id: '',
        date: new Date().toISOString().split('T')[0],
        pods: 0,
        sales: 0,
        cancellations: 0,
        status: 'pending',
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Transactions</h1>
              <p className="text-muted-foreground">Manage daily inventory transactions</p>
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Transactions</h1>
            <p className="text-muted-foreground">Manage daily inventory transactions</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Transaction</DialogTitle>
                <DialogDescription>
                  Add a new transaction for today's activity
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="identifier">Identifier</Label>
                  <Select
                    value={formData.identifier_id}
                    onValueChange={(value) => setFormData({ ...formData, identifier_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an identifier" />
                    </SelectTrigger>
                    <SelectContent>
                      {identifiers.map((identifier) => (
                        <SelectItem key={identifier.id} value={identifier.id}>
                          {identifier.category.toUpperCase()} - {identifier.identifier_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pods">PODs</Label>
                    <Input
                      id="pods"
                      type="number"
                      min="0"
                      value={formData.pods}
                      onChange={(e) => setFormData({ ...formData, pods: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sales">Sales</Label>
                    <Input
                      id="sales"
                      type="number"
                      min="0"
                      value={formData.sales}
                      onChange={(e) => setFormData({ ...formData, sales: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cancellations">Cancellations</Label>
                    <Input
                      id="cancellations"
                      type="number"
                      min="0"
                      value={formData.cancellations}
                      onChange={(e) => setFormData({ ...formData, cancellations: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'pending' | 'arrived' | 'canceled') => 
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="arrived">Arrived</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!formData.identifier_id}>
                    Create Transaction
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Transactions List */}
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <Card key={transaction.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">
                        {transaction.identifier?.category?.toUpperCase()} - {transaction.identifier?.identifier_number}
                      </h3>
                      <Badge
                        variant={
                          transaction.status === 'arrived'
                            ? 'default'
                            : transaction.status === 'pending'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-1 h-4 w-4" />
                      {new Date(transaction.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">PODs:</span> {transaction.pods}
                      </div>
                      <div>
                        <span className="font-medium">Sales:</span> {transaction.sales}
                      </div>
                      <div>
                        <span className="font-medium">Cancellations:</span> {transaction.cancellations}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {transactions.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-muted-foreground">
                  <Calendar className="mx-auto h-12 w-12 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
                  <p>Start by creating your first transaction to track inventory changes.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;