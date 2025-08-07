import { useInventory } from '@/hooks/useInventory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, TrendingUp, AlertCircle, DollarSign } from 'lucide-react';

const Dashboard = () => {
  const { balances, transactions, loading } = useInventory();

  if (loading) {
    return (
      <div className="container mx-auto px-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Overview of your inventory</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalItems = balances.reduce((sum, balance) => sum + balance.current_quantity, 0);
  const totalValue = balances.reduce((sum, balance) => sum + balance.current_cost, 0);
  const lowStockItems = balances.filter(balance => balance.current_quantity < 10).length;
  const recentTransactions = transactions.slice(0, 5);

  const stats = [
    {
      title: 'Total Items',
      value: totalItems.toString(),
      description: 'Items in inventory',
      icon: Package,
      color: 'text-blue-600',
    },
    {
      title: 'Total Value',
      value: `$${totalValue.toFixed(2)}`,
      description: 'Current inventory value',
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Low Stock',
      value: lowStockItems.toString(),
      description: 'Items below 10 units',
      icon: AlertCircle,
      color: 'text-red-600',
    },
    {
      title: 'Transactions',
      value: transactions.length.toString(),
      description: 'Total transactions',
      icon: TrendingUp,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="container mx-auto px-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your inventory</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Current Balances */}
        <Card>
          <CardHeader>
            <CardTitle>Current Balances by Identifier</CardTitle>
            <CardDescription>
              Real-time inventory levels for all identifiers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {balances.map((balance) => (
                <div
                  key={balance.identifier_id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">
                        {balance.identifier?.category?.toUpperCase()} - {balance.identifier?.identifier_number}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Identifier ID: {balance.identifier_id}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {balance.current_quantity} units
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ${balance.current_cost.toFixed(2)}
                    </p>
                    {balance.current_quantity < 10 && (
                      <Badge variant="destructive" className="mt-1">
                        Low Stock
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {balances.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No balance data available. Create some identifiers and opening balances to get started.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Latest transaction activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">
                        {transaction.identifier?.category?.toUpperCase()} - {transaction.identifier?.identifier_number}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
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
                    <p className="text-sm text-muted-foreground mt-1">
                      PODs: {transaction.pods} | Sales: {transaction.sales} | Cancellations: {transaction.cancellations}
                    </p>
                  </div>
                </div>
              ))}
              {recentTransactions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No recent transactions found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;