"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  className?: string;
  showLabelOnMd?: boolean;
}

export function LogoutButton({
  className,
  showLabelOnMd = true,
}: LogoutButtonProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-950/40 font-bold text-xs transition-colors text-left group",
            className,
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className={cn(!showLabelOnMd && "md:hidden lg:inline")}>
            Logout
          </span>
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-lg border-2 border-foreground shadow-none">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-headline font-bold text-xl">
            Confirm logout
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Are you sure you want to log out of your account? You will need to
            sign in again to access your orders and profile.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-lg border-foreground font-bold text-xs h-12">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSignOut}
            className="rounded-lg bg-red-600 hover:bg-red-700 font-bold text-xs text-white h-12"
          >
            Logout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
