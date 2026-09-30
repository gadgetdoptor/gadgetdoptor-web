"use client";

import { useState, useEffect, useTransition } from "react";
import { getAllAdmins, createAdmin, updateAdmin, deleteAdmin } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ShieldCheck, Plus, Trash2, Edit, User, Mail, ShieldAlert, Key } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function AdministrationPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "staff",
    isActive: true,
  });

  const fetchAdmins = async () => {
    const data = await getAllAdmins();
    setAdmins(data);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleEdit = (admin: any) => {
    setEditingAdmin(admin);
    setFormData({
      username: admin.username,
      email: admin.email,
      password: "", // Don't show existing password
      role: admin.role,
      isActive: admin.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    startTransition(async () => {
      const result = editingAdmin 
        ? await updateAdmin(editingAdmin.id, formData)
        : await createAdmin(formData);

      if (result.success) {
        toast.success(editingAdmin ? "Staff updated" : "Staff created");
        setIsDialogOpen(false);
        setEditingAdmin(null);
        setFormData({ username: "", email: "", password: "", role: "staff", isActive: true });
        fetchAdmins();
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleDelete = async (id: string, username: string) => {
    if (username === 'reyad') {
       toast.error("Cannot delete root superadmin");
       return;
    }
    if (!confirm(`Are you sure you want to remove ${username}?`)) return;
    
    const result = await deleteAdmin(id);
    if (result.success) {
      toast.success("Staff removed");
      fetchAdmins();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold font-headline tracking-tight">System & administration</h1>
          <p className="text-muted-foreground text-xs">Manage administrative access and roles for your team.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
                setEditingAdmin(null);
                setFormData({ username: "", email: "", password: "", role: "staff", isActive: true });
            }} className="w-full sm:w-auto rounded-[10px] bg-primary text-primary-foreground hover:bg-primary/90 border-none px-6 font-bold uppercase tracking-widest text-xs h-12 shadow-xl shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[16px] border-border sm:max-w-[600px] w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold tracking-tight">
                {editingAdmin ? "Edit staff access" : "Grant new access"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Username" 
                      className="rounded-[10px] pl-10 h-12 border-border focus-visible:ring-ring"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="email"
                      placeholder="Email" 
                      className="rounded-[10px] pl-10 h-12 border-border focus-visible:ring-ring"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground">{editingAdmin ? "New Password (optional)" : "Password"}</label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="password"
                    placeholder="Set secret key" 
                    className="rounded-[10px] pl-10 h-12 border-border focus-visible:ring-ring"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingAdmin}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">Assigned Role</label>
                  <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val })}>
                    <SelectTrigger className="rounded-[10px] border-border h-12 uppercase text-[10px] font-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-[10px] border-border">
                      <SelectItem value="superadmin">Super Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="staff">Standard Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-muted-foreground">Account Status</label>
                   <div className="flex items-center h-12 px-4 border border-border">
                      <Switch 
                        checked={formData.isActive} 
                        onCheckedChange={(checked) => setFormData({...formData, isActive: checked})} 
                      />
                      <span className="ml-2 text-[10px] font-bold uppercase">{formData.isActive ? 'Active' : 'Inactive'}</span>
                   </div>
                </div>
              </div>

              <Button type="submit" disabled={isPending} className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 rounded-[10px] font-black uppercase tracking-widest text-xs mt-4">
                {isPending ? "Processing..." : editingAdmin ? "Synchronize Updates" : "Initialize Access"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border border-border bg-card shadow-sm overflow-x-auto rounded-[16px]">
        <div className="min-w-[850px]">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/80">
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-5">Staff Identity</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Access Level</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Authorized Since</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-right pr-6">Management</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center text-muted-foreground uppercase text-[10px] font-black tracking-widest">
                    Initializing personnel databank...
                  </TableCell>
                </TableRow>
              ) : (
                admins.map((admin) => (
                  <TableRow key={admin.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-muted flex items-center justify-center">
                           <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-bold tracking-tight">{admin.username}</p>
                          <p className="text-[10px] text-muted-foreground font-bold">{admin.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <ShieldAlert className={cn(
                          "h-3 w-3",
                          admin.role === 'superadmin' ? "text-orange-500" : "text-blue-500"
                        )} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{admin.role}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {admin.isActive ? (
                        <Badge className="bg-green-50 text-green-700 border-green-200 rounded-full uppercase text-[8px] font-black tracking-widest">Authenticated</Badge>
                      ) : (
                        <Badge variant="destructive" className="rounded-full uppercase text-[8px] font-black tracking-widest">Access Revoked</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">
                        {format(new Date(admin.createdAt), "MMM dd, yyyy")}
                      </p>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                         <Button variant="outline" size="icon" onClick={() => handleEdit(admin)} className="h-8 w-8 rounded-[8px] border-border hover:border-foreground hover:bg-muted transition-all">
                            <Edit className="h-3.5 w-3.5" />
                         </Button>
                         <Button variant="outline" size="icon" onClick={() => handleDelete(admin.id, admin.username)} className="h-8 w-8 rounded-[8px] border-border hover:border-red-600 hover:text-red-600 hover:bg-red-50 transition-all">
                            <Trash2 className="h-3.5 w-3.5" />
                         </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
