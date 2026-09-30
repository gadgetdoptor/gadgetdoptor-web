"use client";

import { useState, useEffect, useTransition } from "react";
import {
  getDeliveryLocations,
  createDeliveryLocation,
  updateDeliveryLocation,
  deleteDeliveryLocation,
} from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, Truck } from "lucide-react";

type DeliveryLocation = {
  id: string;
  name: string;
  fee: string;
  isDefault: boolean;
  sortOrder: number;
};

export function DeliveryLocationsManager() {
  const [locations, setLocations] = useState<DeliveryLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DeliveryLocation | null>(null);
  const [form, setForm] = useState({ name: "", fee: "", isDefault: false, sortOrder: 0 });

  const [deleteTarget, setDeleteTarget] = useState<DeliveryLocation | null>(null);

  const load = async () => {
    setLoading(true);
    const data = await getDeliveryLocations();
    setLocations(data as DeliveryLocation[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", fee: "", isDefault: locations.length === 0, sortOrder: locations.length });
    setDialogOpen(true);
  };

  const openEdit = (loc: DeliveryLocation) => {
    setEditing(loc);
    setForm({ name: loc.name, fee: loc.fee, isDefault: loc.isDefault, sortOrder: loc.sortOrder });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    startTransition(async () => {
      const payload = {
        name: form.name,
        fee: Number(form.fee),
        isDefault: form.isDefault,
        sortOrder: Number(form.sortOrder) || 0,
      };
      const result = editing
        ? await updateDeliveryLocation(editing.id, payload)
        : await createDeliveryLocation(payload);

      if (result.success) {
        toast.success(editing ? "Location updated" : "Location added");
        setDialogOpen(false);
        load();
      } else {
        toast.error(result.message || "Something went wrong");
      }
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteDeliveryLocation(deleteTarget.id);
      if (result.success) {
        toast.success("Location removed");
        setDeleteTarget(null);
        load();
      } else {
        toast.error(result.message || "Failed to remove location");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={openCreate}
          className="rounded-[10px] bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-5 font-black uppercase tracking-widest text-[10px]"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Location
        </Button>
      </div>

      <div className="border border-border rounded-[16px] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Location</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Fee (Tk)</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Default</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : locations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-sm font-bold uppercase tracking-widest">
                  No delivery locations yet.
                </TableCell>
              </TableRow>
            ) : (
              locations.map((loc) => (
                <TableRow key={loc.id}>
                  <TableCell className="font-bold flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" /> {loc.name}
                  </TableCell>
                  <TableCell className="font-bold">Tk {Number(loc.fee).toFixed(0)}</TableCell>
                  <TableCell>
                    {loc.isDefault && (
                      <span className="text-[10px] font-black uppercase tracking-widest bg-primary text-primary-foreground px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-[8px] h-8 w-8"
                      onClick={() => openEdit(loc)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-[8px] h-8 w-8 text-red-500 hover:text-red-600"
                      onClick={() => setDeleteTarget(loc)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-[16px]">
          <DialogHeader>
            <DialogTitle className="font-bold tracking-tight">
              {editing ? "Edit location" : "Add location"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Location Name</label>
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Inside Dhaka"
                className="rounded-[10px] h-11 border-border"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Delivery Fee (Tk)</label>
              <Input
                type="number"
                value={form.fee}
                onChange={(e) => setForm((p) => ({ ...p, fee: e.target.value }))}
                placeholder="60"
                className="rounded-[10px] h-11 border-border"
              />
            </div>
            <div className="flex items-center justify-between border border-border p-3">
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                Set as Default (pre-selected at checkout)
              </label>
              <Switch
                checked={form.isDefault}
                onCheckedChange={(checked) => setForm((p) => ({ ...p, isDefault: checked }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSubmit}
              disabled={isPending || !form.name || form.fee === ""}
              className="w-full rounded-[10px] bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-black uppercase tracking-widest text-xs"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Save Changes" : "Add Location"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-[16px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this location?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.name}" will no longer be selectable at checkout. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-[10px]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-[10px] bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
