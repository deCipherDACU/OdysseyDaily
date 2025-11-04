"use client"

import { Button } from "@/components/ui/button"
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
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { LiquidGlassCard } from "../ui/LiquidGlassCard"
import { LiquidGlassButton } from "../ui/LiquidGlassButton"


export function DataManagement() {
    const { toast } = useToast()

    const handleExport = () => {
        toast({
            title: "Exporting data...",
            description: "Your data is being prepared for download.",
        })
    }
    
    const handleDelete = () => {
         toast({
            title: "Account Deletion Requested",
            description: "Your account is scheduled for deletion. You will receive an email confirmation.",
            variant: "destructive",
        })
    }

    return (
        <>
            <LiquidGlassCard className="p-0">
                <div className="p-6">
                    <h3 className="font-headline text-xl font-bold text-white">Data Management</h3>
                    <p className="text-sm text-muted-foreground">
                        Export or delete your personal data.
                    </p>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <h3 className="font-medium text-white">Export Your Data</h3>
                        <p className="text-sm text-muted-foreground">Download a copy of all your data from LifeQuest.</p>
                    </div>
                     <div>
                        <h3 className="font-medium text-white">Delete Your Account</h3>
                        <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data. This action cannot be undone.</p>
                    </div>
                </div>
                <div className="border-t px-6 py-4 flex justify-between border-white/10">
                     <LiquidGlassButton variant="glass" onClick={handleExport}>Export Data</LiquidGlassButton>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">Delete Account</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your
                                account and remove your data from our servers.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                        </AlertDialog>
                </div>
            </LiquidGlassCard>
        </>
    )
}
