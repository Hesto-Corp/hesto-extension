'use client'

// import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import { User, ExternalLink, ShieldCheck, LogOut } from 'lucide-react'
import { PromptHeader } from './Header'
import { Button } from "@/components/ui/button"
import { signOut } from 'firebase/auth'
import { auth } from '../firebase.config'

export default function IdlePopup({ userName }: { userName: string | null }) {
  const handleSignOut = async () => {
    try {
      await signOut(auth)
      console.log('User signed out successfully')
      // You might want to add additional logic here, such as redirecting the user or updating the UI
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <Card className="w-[350px] min-h-[300px] max-h-[600px] rounded-none shadow-none flex flex-col">
      <PromptHeader />

      <CardContent className="flex-grow p-3 space-y-3 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <User className="h-3 w-3" />
            <span>Hey, {userName ? userName.split(' ')[0] : userName}!</span>
          </div>
          <a
            href="https://hesto.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-emerald-700 hover:text-emerald-800 transition-colors flex items-center"
          >
            Go to Hesto <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </div>

        <div className="text-center space-y-2">
          <motion.div
            animate={{
              rotate: [0, 10, -10, 10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            <ShieldCheck className="h-12 w-12 text-emerald-600 mx-auto" />
          </motion.div>
          <h2 className="text-base font-semibold text-gray-800">Hesto has your back!</h2>
          <p className="text-sm text-gray-600">
            We're your shopping buddy, helping you invest instead of impulse buy.
          </p>
        </div>
        <div className="bg-emerald-50 p-2 rounded-sm border border-emerald-100">
          <h3 className="text-xs font-semibold text-emerald-800 mb-1">Fun Fact:</h3>
          <p className="text-xs text-emerald-700">
            Investing your daily latte money for a year could buy you 52 lattes plus a fancy coffee machine!
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="w-full text-emerald-700 hover:text-emerald-800 border-emerald-200 hover:bg-emerald-50"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </CardContent>
    </Card>
  )
}
