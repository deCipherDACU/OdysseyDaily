
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/context/UserContext"
import { useEffect } from "react"
import { cn } from "@/lib/utils"
import { LiquidGlassCard } from "../ui/LiquidGlassCard"
import { LiquidGlassButton } from "../ui/LiquidGlassButton"
import { Switch } from "../ui/switch"
import { Separator } from "../ui/separator"

const appearanceFormSchema = z.object({
  appTheme: z.enum(["novice", "warrior", "mage"]),
  theme: z.enum(["light", "dark"]),
})

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>

const themes = [
    { name: "novice", label: "Novice", level: 1, colors: "from-purple-500 to-indigo-500" },
    { name: "warrior", label: "Warrior", level: 10, colors: "from-red-500 to-orange-500" },
    { name: "mage", label: "Mage", level: 20, colors: "from-blue-500 to-cyan-500" },
];

export function AppearanceForm() {
  const { toast } = useToast()
  const { user, setUser } = useUser();

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      appTheme: "novice",
      theme: user?.preferences?.theme || 'dark',
    },
  })

  useEffect(() => {
    if (user) {
        const availableThemes = themes.filter(t => user.level >= t.level);
        const highestTheme = availableThemes[availableThemes.length - 1];
        if (highestTheme) {
            form.setValue('appTheme', highestTheme.name as "novice" | "warrior" | "mage");
        }
        form.setValue('theme', user.preferences?.theme || 'dark');
    }
  }, [user, form]);
  
  const selectedAppTheme = form.watch('appTheme');
  const selectedTheme = form.watch('theme');
  
  useEffect(() => {
    document.body.classList.remove(...themes.map(t => `theme-${t.name}`), 'theme-light', 'theme-night');
    if (selectedAppTheme) {
      document.body.classList.add(`theme-${selectedAppTheme}`);
    }
    document.body.classList.add(selectedTheme === 'light' ? 'theme-light' : 'theme-night');
  }, [selectedAppTheme, selectedTheme]);


  function onSubmit(data: AppearanceFormValues) {
    if (user) {
        setUser({ ...user, preferences: { ...user.preferences, theme: data.theme }});
    }

    toast({
      title: "Appearance settings updated",
      description: "Your preferences have been successfully updated.",
    })
  }

  return (
    <LiquidGlassCard className="p-0">
        <div className="p-6">
            <h3 className="font-headline text-xl font-bold text-white">Appearance</h3>
            <p className="text-muted-foreground text-sm">
                Customize the look and feel of the app.
            </p>
        </div>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="p-6 space-y-8">
                     <FormField
                        control={form.control}
                        name="theme"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-primary/10 border-primary/20">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base text-white">Light / Dark Mode</FormLabel>
                                    <FormDescription>
                                       Switch between light and dark themes.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value === 'dark'}
                                        onCheckedChange={(checked) => field.onChange(checked ? 'dark' : 'light')}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                        />
                    
                    <Separator />
                    
                     <FormField
                        control={form.control}
                        name="appTheme"
                        render={({ field }) => (
                            <FormItem className="space-y-1">
                                <FormLabel className="text-white">Color Theme</FormLabel>
                                <FormDescription>
                                    Select your application color theme. New themes unlock as you level up.
                                </FormDescription>
                                <FormMessage />
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    className="grid max-w-md grid-cols-1 pt-2 gap-4 sm:grid-cols-3"
                                >
                                    {themes.map(t => {
                                        const isUnlocked = user ? user.level >= t.level : false;
                                        return (
                                        <FormItem key={t.name}>
                                            <FormLabel className={cn(
                                                "[&:has([data-state=checked])>div]:border-primary",
                                                !isUnlocked && "cursor-not-allowed opacity-50"
                                            )}>
                                                <FormControl>
                                                    <RadioGroupItem value={t.name} className="sr-only" disabled={!isUnlocked}/>
                                                </FormControl>
                                                <div className={cn(
                                                    "items-center rounded-md border-2 border-muted p-1 hover:border-accent",
                                                    !isUnlocked && "hover:border-muted"
                                                )}>
                                                    <div className={cn(
                                                        "flex h-24 w-full items-center justify-center rounded-sm p-2 font-semibold text-white",
                                                        `bg-gradient-to-br ${t.colors}`
                                                    )}>
                                                        {t.label}
                                                    </div>
                                                </div>
                                                 <span className="block w-full p-2 text-center font-normal text-white">
                                                    {isUnlocked ? 'Unlocked' : `Lvl ${t.level}`}
                                                </span>
                                            </FormLabel>
                                        </FormItem>
                                        )
                                    })}
                                </RadioGroup>
                            </FormItem>
                        )}
                    />
                </div>
                 <div className="border-t px-6 py-4 border-white/10">
                    <LiquidGlassButton type="submit">Update preferences</LiquidGlassButton>
                </div>
            </form>
        </Form>
    </LiquidGlassCard>
  )
}
