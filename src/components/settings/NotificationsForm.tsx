"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { useUser } from "@/context/UserContext"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Separator } from "../ui/separator"
import { LiquidGlassCard } from "../ui/LiquidGlassCard"
import { LiquidGlassButton } from "../ui/LiquidGlassButton"

const notificationsFormSchema = z.object({
  reminder: z.boolean().default(true).optional(),
  motivation: z.boolean().default(true).optional(),
  achievement: z.boolean().default(true).optional(),
  health_warning: z.boolean().default(true).optional(),
  streak_reminder: z.boolean().default(true).optional(),
  daily_check_in: z.boolean().default(true).optional(),
  ai_personalization: z.boolean().default(true).optional(),
  style: z.enum(['creative', 'funny', 'calm', 'motivational', 'random']).default('random'),
})

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>

export function NotificationsForm() {
  const { toast } = useToast()
  const { user, setUser } = useUser()

  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: user?.notificationPreferences || {
      reminder: true,
      motivation: true,
      achievement: true,
      health_warning: true,
      streak_reminder: true,
      daily_check_in: true,
      ai_personalization: true,
      style: 'random',
    },
  })

  function onSubmit(data: NotificationsFormValues) {
    if (user) {
        setUser({ ...user, notificationPreferences: data });
    }
    toast({
      title: "Notifications updated",
      description: "Your notification preferences have been successfully updated.",
    })
  }

  return (
    <LiquidGlassCard className="p-0">
        <div className="p-6">
            <h3 className="font-headline text-xl font-bold text-white">Notifications</h3>
            <p className="text-muted-foreground text-sm">
                Configure how you receive in-app notifications.
            </p>
        </div>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="ai_personalization"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-primary/10 border-primary/20">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base text-white">AI Personalization</FormLabel>
                                    <FormDescription>Allow AI to tailor notifications based on your activity and personality.</FormDescription>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                </FormItem>
                            )}
                        />
                        <Controller
                            name="style"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 border-white/10">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base text-white">Notification Style</FormLabel>
                                        <FormDescription>Choose the tone for AI-generated notifications.</FormDescription>
                                    </div>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Select a style" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="random">Random</SelectItem>
                                            <SelectItem value="creative">Creative</SelectItem>
                                            <SelectItem value="funny">Funny</SelectItem>
                                            <SelectItem value="calm">Calm</SelectItem>
                                            <SelectItem value="motivational">Motivational</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                    </div>

                    <Separator className="bg-white/10"/>
                    
                    <div className="space-y-2">
                        <h3 className="text-lg font-medium text-white">Notification Types</h3>
                        <p className="text-sm text-muted-foreground">Enable or disable specific kinds of notifications.</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="reminder"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 border-white/10">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base text-white">Task Reminders</FormLabel>
                                    <FormDescription>Get notified when quests are due.</FormDescription>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="motivation"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 border-white/10">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base text-white">Motivation</FormLabel>
                                    <FormDescription>Receive motivational boosts.</FormDescription>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="achievement"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 border-white/10">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base text-white">Achievements</FormLabel>
                                    <FormDescription>Get alerts for new achievements.</FormDescription>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="health_warning"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 border-white/10">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base text-white">Health Warnings</FormLabel>
                                    <FormDescription>Warnings for low health.</FormDescription>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="streak_reminder"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 border-white/10">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base text-white">Streak Reminders</FormLabel>
                                    <FormDescription>Reminders to keep your streak.</FormDescription>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="daily_check_in"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 border-white/10">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base text-white">Daily Check-in</FormLabel>
                                    <FormDescription>A morning summary notification.</FormDescription>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
                <div className="border-t px-6 py-4 border-white/10">
                    <LiquidGlassButton type="submit">Update notifications</LiquidGlassButton>
                </div>
            </form>
        </Form>
    </LiquidGlassCard>
  )
}
