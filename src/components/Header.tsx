import { Pause, Clock } from 'lucide-react';
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from 'framer-motion';

export function PromptHeader() {
  return (
    <CardHeader className="bg-gradient-to-r from-emerald-700 to-emerald-900 text-white p-3 rounded-none">
      <CardTitle className="text-xl flex items-center gap-2 mb-1">
        <motion.div
          animate={{
            y: [0, -5, 0],
            rotate: [0, 5, 0, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Pause className="h-5 w-5" />
        </motion.div>
        Hesto
      </CardTitle>
      <CardDescription className="text-gray-200 text-xs flex items-center gap-1">
        <Clock className="h-3 w-3" />
        A little hesitation{' '}
        <span className="font-bold text-emerald-300 relative">
          compounds fast
          <svg className="absolute -bottom-0.5 left-0 w-full" height="5" viewBox="0 0 100 5" preserveAspectRatio="none">
            <path d="M0,2 Q25,5 50,2 T100,2" stroke="currentColor" strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" />
          </svg>
        </span>
      </CardDescription>
    </CardHeader>
  );
}
