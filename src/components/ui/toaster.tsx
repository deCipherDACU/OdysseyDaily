"use client"

import { useToast } from "@/hooks/use-toast"
import { Toast } from "@/components/ui/toast"
import { AnimatePresence } from "framer-motion"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <ul
      className="fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:top-auto sm:bottom-0 sm:right-0 md:max-w-md gap-3"
    >
      <AnimatePresence>
        {toasts.map(function ({ id, title, description, action, ...props }) {
          return (
            <Toast key={id} {...props} id={id} title={title} description={description} onDismiss={dismiss} />
          )
        })}
      </AnimatePresence>
    </ul>
  )
}
