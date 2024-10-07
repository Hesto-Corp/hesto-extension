import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Pause, DollarSign, ShoppingCart, Clock, ArrowRight, User, TrendingUp, ExternalLink } from 'lucide-react'
import Confetti from 'react-confetti'

export default function App() {
  const [purchaseAmount, setPurchaseAmount] = useState<number | null>(null)
  const [investmentGrowth, setInvestmentGrowth] = useState<number | null>(null)
  const [decision, setDecision] = useState<'invest' | null>(null)
  const [userName, setUserName] = useState<string>('')
  const [totalInvested, setTotalInvested] = useState<number>(2571.92)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    setPurchaseAmount(99.99)
    setUserName('Alice')
  }, [])

  useEffect(() => {
    if (purchaseAmount) {
      const growth = purchaseAmount * Math.pow(1.105, 15)
      setInvestmentGrowth(growth)
    }
  }, [purchaseAmount])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const handleInvest = () => {
    setDecision('invest')
    if (purchaseAmount) {
      setTotalInvested(prevTotal => prevTotal + purchaseAmount)
    }
    setShowConfetti(true)
  }

  const handlePurchase = () => {
    window.close()
  }

  return (
    <Card className="w-[350px] bg-gray-50 text-gray-900">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={true} />}
      <CardHeader className="bg-gray-800 text-white">
        <CardTitle className="text-2xl flex items-center gap-2">
          <Pause className="h-6 w-6" />
          Hesto
        </CardTitle>
        <CardDescription className="text-gray-300 flex items-center gap-1">
          <Clock className="h-4 w-4" />
          A little hesitation
          <ArrowRight className="h-4 w-4" />
          goes a long way
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>Hey, {userName}!</span>
          </div>
          <a
            href="https://hesto.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-emerald-700 hover:text-emerald-800 transition-colors flex items-center"
          >
            Go to Hesto <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </div>
        <p className="text-gray-700">
          Impulse buy? Let's pause and consider investing instead.
        </p>
        {purchaseAmount && (
          <div className="flex items-center justify-between bg-gray-200 p-3 rounded-md">
            <span className="font-semibold text-gray-800">Purchase Amount:</span>
            <span className="text-xl font-bold text-gray-900">{formatCurrency(purchaseAmount)}</span>
          </div>
        )}
        {investmentGrowth && (
          <div className="bg-green-100 p-3 rounded-md">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-green-800">Potential Growth:</span>
              <span className="text-xl font-bold text-green-700">{formatCurrency(investmentGrowth)}</span>
            </div>
            <p className="text-sm mt-2 text-green-600 italic">
              Based on historical market performance
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                className="w-[45%] bg-emerald-700 hover:bg-emerald-800 text-white font-sans text-base font-semibold tracking-wide py-2.5 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
                onClick={handleInvest}
                disabled={decision === 'invest'}
              >
                Invest <DollarSign className="ml-2 h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{decision === 'invest' ? 'Already invested' : 'Choose to invest instead'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href="#"
                className="text-gray-600 hover:text-gray-800 transition-colors flex items-center"
                onClick={(e) => {
                  e.preventDefault();
                  handlePurchase();
                }}
              >
                I really want this <ShoppingCart className="ml-2 h-4 w-4" />
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p>Proceed with your purchase</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
      {decision === 'invest' && (
        <div className="p-4 bg-emerald-700 mt-2 rounded-b-lg border-t border-emerald-600">
          <p className="font-medium text-center text-white mb-3">
            Great choice. Future {userName} is proud!
          </p>
          <div className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm">
            <span className="font-medium text-gray-800 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-emerald-700" />
              Total Invested with Hesto:
            </span>
            <span className="text-xl font-bold text-emerald-700">{formatCurrency(totalInvested)}</span>
          </div>
        </div>
      )}
    </Card>
  )
}
