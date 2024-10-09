import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { DollarSign, ShoppingCart, User, ExternalLink, PiggyBank, Star, X } from 'lucide-react';
import { PromptHeader } from './Header'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from 'framer-motion';

interface PromptPopupProps {
  purchasePrice: number | null;
}

export default function PromptPopup({ purchasePrice, userName }: PromptPopupProps & { userName: string | null}) {
  const [purchaseAmount, setPurchaseAmount] = useState<number | null>(null);
  const [investmentGrowth, setInvestmentGrowth] = useState<number | null>(null);
  const [decision, setDecision] = useState<'invest' | null>(null);
  const [totalInvested, setTotalInvested] = useState<number>(2571.92);
  const [showConfetti, setShowConfetti] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (purchasePrice) {
      setPurchaseAmount(purchasePrice);
    }
  }, [purchasePrice]);

  useEffect(() => {
    if (purchaseAmount) {
      const growth = purchaseAmount * Math.pow(1.105, 15);
      setInvestmentGrowth(growth);
    }
  }, [purchaseAmount]);

  useEffect (()  => {
    let timer: NodeJS.Timeout
    if (countdown !== null && countdown > 0){
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    } else if (countdown === 0) {
      window.location.href = 'https://hesto.io'
      setShowConfetti(false);
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const handleInvest = () => {
    setDecision('invest');
    if (purchaseAmount) {
      setTotalInvested(prevTotal => prevTotal + purchaseAmount);
    }
    setShowConfetti(true);
    setCountdown(10)  // This is where the timer is set to 5 seconds
  };

  const handlePurchase = () => {
    window.close();
  };

  const stopRedirect = () => {
    setCountdown(null)
    window.close();
  }

  return (
    <Card className="w-[350px] min-h-[500px] max-h-[600px] rounded-none shadow-none flex flex-col">
      {showConfetti && <Confetti width={350} height={500} recycle={true} numberOfPieces={200}/>}

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
        <p className="text-sm text-gray-700 font-medium">
          Impulse buy? Let's pause and consider investing instead.
        </p>
        <AnimatePresence>
          {purchaseAmount && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between bg-white p-2 shadow-sm border border-gray-200"
            >
              <span className="text-xs font-semibold text-gray-800">Purchase Amount:</span>
              <span className="text-sm font-bold text-gray-900">{formatCurrency(purchaseAmount)}</span>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {investmentGrowth && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-emerald-100 p-2 shadow-sm border border-emerald-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-800">Potential Growth:</span>
                <span className="text-sm font-bold text-emerald-700">{formatCurrency(investmentGrowth)}</span>
              </div>
              <p className="text-xs mt-1 text-emerald-600 italic">
                Based on historical market performance
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {decision !== 'invest' && (
            <motion.div
              initial={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full h-32 bg-gray-100 rounded-sm overflow-hidden"
            >
              <img
                // src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExbW1ucHZmZDA0aXU2dG12MHF6ZnB4OXdpeXRzODNuc3hobHNvbmM3cSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xMhRsMMmQbu41zPKDu/giphy.gif?height=128&width=318"
                src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExdWxseGNsdGx2MzJ5aGZxdmN3aDh1N2V5d3BpZnhyanhrZ3pxaWtpMCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/f9jwBVzohvX7LSRqWU/giphy.gif?height=128&width=318"
                alt="Investment growth visualization"
                className="w-full h-full object-cover"
              />
              </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
      <CardFooter className="p-3 bg-gray-100 border-t border-gray-200 rounded-none">
        <div className="flex justify-between items-center w-full">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-sans text-sm font-semibold tracking-wide py-2 px-4 rounded-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center"
                    onClick={handleInvest}
                    disabled={decision === 'invest'}
                  >
                    Invest <DollarSign className="ml-1 h-4 w-4" />
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{decision === 'invest' ? 'Already invested' : 'Choose to invest instead'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.a
                  href="#"
                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors flex items-center"
                  onClick={(e) => {
                    e.preventDefault()
                    handlePurchase()
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  I really want this <ShoppingCart className="ml-1 h-4 w-4" />
                </motion.a>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Proceed with your purchase</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardFooter>
      <AnimatePresence>
        {decision === 'invest' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-r from-emerald-700 to-emerald-900 overflow-hidden"
          >
            <div className="p-3 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <Star className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-base font-bold text-white mb-1"
              >
                Fantastic choice, {userName ? userName.split(' ')[0] : userName}!
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xs text-emerald-200 mb-2"
              >
                Your future self is doing a happy dance!
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-emerald-800 bg-opacity-50 p-2 rounded-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <PiggyBank className="h-4 w-4 text-emerald-300 mr-2" />
                    <span className="text-xs font-medium text-emerald-100">Total Invested with Hesto:</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-300">{formatCurrency(totalInvested)}</span>
                </div>
              </motion.div>

              {countdown !== null && (
                <div
                  className="mt-1 text-emerald-200 text-xs flex items-center justify-center"
                >
                  <span>Redirecting to Hesto in {countdown}...</span>
                    <button
                      onClick={stopRedirect}
                      className="ml-2 p-0 bg-transparent text-emerald-200 hover:text-emerald-300 border-none outline-none focus:outline-none focus:ring-0 active:outline-none active:ring-0 transition-colors duration-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}
