"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/context/UserContext"
import { LiquidGlassCard } from "../ui/LiquidGlassCard"
import { LiquidGlassButton } from "../ui/LiquidGlassButton"

const profileFormSchema = z.object({
  username: z
    .string()
    .min(2, {
      message: "Username must be at least 2 characters.",
    })
    .max(30, {
      message: "Username must not be longer than 30 characters.",
    }),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileForm() {
  const { toast } = useToast()
  const { user, setUser } = useUser()

  const defaultValues: Partial<ProfileFormValues> = {
    username: user?.name,
  }

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  })

  function onSubmit(data: ProfileFormValues) {
    if (user) {
        setUser({ ...user, name: data.username });
    }
    toast({
      title: "Profile updated",
      description: "Your profile information has been successfully updated.",
    })
  }

  return (
    <LiquidGlassCard className="p-0">
        <div className="p-6">
            <h3 className="font-headline text-xl font-bold text-white">Profile</h3>
            <p className="text-muted-foreground text-sm">
                This is how others will see you on the site.
            </p>
        </div>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="p-6 space-y-4">
                    <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-white">Username</FormLabel>
                        <FormControl>
                            <Input placeholder="Your username" {...field} />
                        </FormControl>
                        <FormDescription>
                            This is your public display name. It can be your real name or a
                            pseudonym.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                <div className="border-t px-6 py-4 border-white/10">
                    <LiquidGlassButton type="submit">Update profile</LiquidGlassButton>
                </div>
            </form>
        </Form>
    </LiquidGlassCard>
  )
}
