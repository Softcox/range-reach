import { useState } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Settings, Package, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const Admin = () => {
  const { 
    identifiers, 
    items, 
    openingBalances, 
    loading, 
    createIdentifier, 
    createItem, 
    updateOpeningBalance 
  } = useInventory();

  const [dialogs, setDialogs] = useState({
    identifier: false,
    item: false,
    balance: false,
  });

  const [forms, setForms] = useState({
    identifier: {
      category: 'range1' as 'range1' | 'range2',
      identifier_number: 0,
    },
    item: {
      identifier_id: '',
      name: '',
      unit_of_measurement: '',
      unit_price: 0,
    },
    balance: {
      identifier_id: '',
      opening_quantity: 0,
      opening_cost: 0,
    },
  });

  const handleSubmitIdentifier = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await createIdentifier(
      forms.identifier.category, 
      forms.identifier.identifier_number
    );
    if (success) {
      setDialogs({ ...dialogs, identifier: false });
      setForms({
        ...forms,
        identifier: { category: 'range1', identifier_number: 0 }
      });
    }
  };

  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await createItem(forms.item);
    if (success) {
      setDialogs({ ...dialogs, item: false });
      setForms({
        ...forms,
        item: {
          identifier_id: '',
          name: '',
          unit_of_measurement: '',
          unit_price: 0,
        }
      });
    }
  };

  const handleSubmitBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateOpeningBalance(
      forms.balance.identifier_id,
      forms.balance.opening_quantity,
      forms.balance.opening_cost
    );
    if (success) {
      setDialogs({ ...dialogs, balance: false });
      setForms({
        ...forms,
        balance: {
          identifier_id: '',
          opening_quantity: 0,
          opening_cost: 0,
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Manage system configuration and data</p>
          </div>
          
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
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
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage system configuration and data</p>
        </div>

        <Tabs defaultValue="identifiers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="identifiers">Identifiers</TabsTrigger>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="balances">Opening Balances</TabsTrigger>
          </TabsList>

          {/* Identifiers Tab */}
          <TabsContent value="identifiers">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center">
                      <Package className="mr-2 h-5 w-5" />
                      Identifiers
                    </CardTitle>
                    <CardDescription>
                      Manage identifier numbers for range categories
                    </CardDescription>
                  </div>
                  <Dialog 
                    open={dialogs.identifier} 
                    onOpenChange={(open) => setDialogs({ ...dialogs, identifier: open })}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Identifier
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Identifier</DialogTitle>
                        <DialogDescription>
                          Add a new identifier number to a range category
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmitIdentifier} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={forms.identifier.category}
                            onValueChange={(value: 'range1' | 'range2') => 
                              setForms({
                                ...forms,
                                identifier: { ...forms.identifier, category: value }
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="range1">Range 1</SelectItem>
                              <SelectItem value="range2">Range 2</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="identifier_number">Identifier Number</Label>
                          <Input
                            id="identifier_number"
                            type="number"
                            min="1"
                            value={forms.identifier.identifier_number}
                            onChange={(e) => setForms({
                              ...forms,
                              identifier: {
                                ...forms.identifier,
                                identifier_number: parseInt(e.target.value) || 0
                              }
                            })}
                            required
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDialogs({ ...dialogs, identifier: false })}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">Create</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {identifiers.map((identifier) => (
                    <div
                      key={identifier.id}
                      className="flex justify-between items-center p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {identifier.category.toUpperCase()} - {identifier.identifier_number}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Created: {new Date(identifier.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {identifiers.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No identifiers created yet. Create your first identifier to get started.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Items Tab */}
          <TabsContent value="items">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center">
                      <FileText className="mr-2 h-5 w-5" />
                      Items
                    </CardTitle>
                    <CardDescription>
                      Manage products linked to identifiers
                    </CardDescription>
                  </div>
                  <Dialog 
                    open={dialogs.item} 
                    onOpenChange={(open) => setDialogs({ ...dialogs, item: open })}
                  >
                    <DialogTrigger asChild>
                      <Button disabled={identifiers.length === 0}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Item
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Item</DialogTitle>
                        <DialogDescription>
                          Add a new product item to an identifier
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmitItem} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="item_identifier">Identifier</Label>
                          <Select
                            value={forms.item.identifier_id}
                            onValueChange={(value) => setForms({
                              ...forms,
                              item: { ...forms.item, identifier_id: value }
                            })}
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
                          <Label htmlFor="item_name">Name</Label>
                          <Input
                            id="item_name"
                            value={forms.item.name}
                            onChange={(e) => setForms({
                              ...forms,
                              item: { ...forms.item, name: e.target.value }
                            })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="unit_measurement">Unit of Measurement</Label>
                          <Input
                            id="unit_measurement"
                            value={forms.item.unit_of_measurement}
                            onChange={(e) => setForms({
                              ...forms,
                              item: { ...forms.item, unit_of_measurement: e.target.value }
                            })}
                            placeholder="e.g., pieces, kg, liters"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="unit_price">Unit Price ($)</Label>
                          <Input
                            id="unit_price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={forms.item.unit_price}
                            onChange={(e) => setForms({
                              ...forms,
                              item: { ...forms.item, unit_price: parseFloat(e.target.value) || 0 }
                            })}
                            required
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDialogs({ ...dialogs, item: false })}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={!forms.item.identifier_id}>
                            Create
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.identifier?.category?.toUpperCase()} - {item.identifier?.identifier_number} | 
                          {item.unit_of_measurement} | ${item.unit_price}/unit
                        </p>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No items created yet. Create identifiers first, then add items.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Opening Balances Tab */}
          <TabsContent value="balances">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center">
                      <Settings className="mr-2 h-5 w-5" />
                      Opening Balances
                    </CardTitle>
                    <CardDescription>
                      Configure starting inventory balances for identifiers
                    </CardDescription>
                  </div>
                  <Dialog 
                    open={dialogs.balance} 
                    onOpenChange={(open) => setDialogs({ ...dialogs, balance: open })}
                  >
                    <DialogTrigger asChild>
                      <Button disabled={identifiers.length === 0}>
                        <Plus className="mr-2 h-4 w-4" />
                        Set Balance
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Set Opening Balance</DialogTitle>
                        <DialogDescription>
                          Configure the starting inventory for an identifier
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmitBalance} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="balance_identifier">Identifier</Label>
                          <Select
                            value={forms.balance.identifier_id}
                            onValueChange={(value) => setForms({
                              ...forms,
                              balance: { ...forms.balance, identifier_id: value }
                            })}
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
                          <Label htmlFor="opening_quantity">Opening Quantity</Label>
                          <Input
                            id="opening_quantity"
                            type="number"
                            min="0"
                            value={forms.balance.opening_quantity}
                            onChange={(e) => setForms({
                              ...forms,
                              balance: { ...forms.balance, opening_quantity: parseInt(e.target.value) || 0 }
                            })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="opening_cost">Opening Cost ($)</Label>
                          <Input
                            id="opening_cost"
                            type="number"
                            step="0.01"
                            min="0"
                            value={forms.balance.opening_cost}
                            onChange={(e) => setForms({
                              ...forms,
                              balance: { ...forms.balance, opening_cost: parseFloat(e.target.value) || 0 }
                            })}
                            required
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDialogs({ ...dialogs, balance: false })}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={!forms.balance.identifier_id}>
                            Save
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {openingBalances.map((balance) => (
                    <div
                      key={balance.id}
                      className="flex justify-between items-center p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {balance.identifier?.category?.toUpperCase()} - {balance.identifier?.identifier_number}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {balance.opening_quantity} | Cost: ${balance.opening_cost.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {openingBalances.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No opening balances configured yet. Set balances for your identifiers.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;