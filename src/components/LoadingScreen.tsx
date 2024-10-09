'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { PromptHeader } from './Header'

export default function LoadingScreen() {
  return (
    <Card className="w-[350px] min-h-[300px] max-h-[600px] rounded-none shadow-none flex flex-col">
      <PromptHeader />

      <CardContent className="flex-grow p-3 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto" />
          <h2 className="text-base font-semibold text-gray-800">Loading</h2>
          <p className="text-sm text-gray-600">
            Please wait while we set things up...
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
