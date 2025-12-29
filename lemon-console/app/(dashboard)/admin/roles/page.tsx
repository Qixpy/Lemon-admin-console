'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Shield, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminRolesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    message: string;
    requestId?: string;
  } | null>(null);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      toast.error('Access denied. Admin privileges required.');
      router.push('/dashboard');
    }
  }, [user, router]);

  if (user?.role !== 'ADMIN') {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const userIdNum = parseInt(userId, 10);
    if (isNaN(userIdNum) || userIdNum <= 0) {
      toast.error('Please enter a valid user ID');
      return;
    }

    setIsSubmitting(true);
    setLastResult(null);

    try {
      const response = await fetch(`/api/lemon/admin/users/${userIdNum}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setLastResult({
          success: true,
          message: `Successfully updated user ${userIdNum} to ${role} role`,
        });
        toast.success('Role updated successfully');
        setUserId('');
      } else {
        const errorMessage = data.error?.message || 'Failed to update role';
        const requestId = data.error?.requestId;
        
        setLastResult({
          success: false,
          message: errorMessage,
          requestId,
        });
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage = 'Failed to connect to server';
      setLastResult({
        success: false,
        message: errorMessage,
      });
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Manage User Roles
        </h1>
        <p className="text-muted-foreground">
          Update user roles and permissions
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Update User Role</CardTitle>
            <CardDescription>
              Change a user's role between USER and ADMIN
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  type="number"
                  placeholder="Enter user ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                  disabled={isSubmitting}
                  min="1"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the numeric ID of the user (e.g., 1, 2, 3)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">New Role</Label>
                <Select
                  value={role}
                  onValueChange={(value) => setRole(value as 'USER' | 'ADMIN')}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">USER</SelectItem>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select the role to assign to the user
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Updating Role...' : 'Update Role'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role Information</CardTitle>
            <CardDescription>
              Understanding user roles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">USER</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Can view and manage their own items</li>
                <li>Cannot see other users' items</li>
                <li>Cannot access admin tools</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">ADMIN</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Can view all users' items</li>
                <li>Can manage user roles</li>
                <li>Full access to all features</li>
              </ul>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>
                  Changes take effect immediately. Be careful when assigning ADMIN roles.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {lastResult && (
        <Card className={lastResult.success ? 'border-green-500' : 'border-red-500'}>
          <CardHeader>
            <CardTitle className={lastResult.success ? 'text-green-600' : 'text-red-600'}>
              {lastResult.success ? 'Success' : 'Error'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>{lastResult.message}</p>
            {lastResult.requestId && (
              <p className="text-xs text-muted-foreground">
                Request ID: <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">{lastResult.requestId}</code>
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="bg-slate-50 dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-sm">Quick Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Your User ID:</strong> <code className="bg-white dark:bg-slate-800 px-1 rounded">{user.id}</code></p>
            <p><strong>Your Role:</strong> <code className="bg-white dark:bg-slate-800 px-1 rounded">{user.role}</code></p>
            <p className="text-xs text-muted-foreground mt-2">
              You can find user IDs in the items list when "Show all users' items" is enabled.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
