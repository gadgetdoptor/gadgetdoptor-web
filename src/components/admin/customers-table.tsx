"use client";

import { useState } from "react";
import {
    Search,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    MoreHorizontal,
    ExternalLink
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

export function AdminCustomersTable({ initialCustomers }: { initialCustomers: any[] }) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredCustomers = initialCustomers.filter(customer =>
        `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.phoneNumber && customer.phoneNumber.includes(searchTerm))
    );

    return (
        <div className="space-y-4">
            <div className="flex bg-card p-4 border border-border">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, email or phone..."
                        className="pl-10 h-11 rounded-[10px] border-border focus-visible:ring-ring"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="border border-border bg-card overflow-hidden rounded-[16px]">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted hover:bg-muted">
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Customer</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contact</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Location</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Joined</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCustomers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-40 text-center text-muted-foreground">
                                    <User className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">No customers found</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCustomers.map((customer) => (
                                <TableRow key={customer.id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center border border-border shrink-0 uppercase font-black text-xs text-muted-foreground">
                                                {customer.firstName?.[0] || 'U'}
                                                {customer.lastName?.[0] || ''}
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-bold tracking-tight">
                                                    {customer.firstName} {customer.lastName}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground font-mono">{customer.id}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Mail className="h-3 w-3" /> {customer.email}
                                            </div>
                                            {customer.phoneNumber && (
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Phone className="h-3 w-3" /> {customer.phoneNumber}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-medium text-muted-foreground truncate max-w-[200px]">
                                                {customer.address || "No address"}
                                            </p>
                                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                                                {customer.district || "N/A"}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(customer.createdAt), "MMM d, yyyy")}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 rounded-[10px] border-border">
                                                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Manage Customer</DropdownMenuLabel>
                                                <DropdownMenuItem className="cursor-pointer">
                                                    <ExternalLink className="mr-2 h-4 w-4" /> View Transactions
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
