"use client"

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Lock, Mail, AlertCircle, Loader2 } from 'lucide-react'
import { PromptHeader } from './Header'
import { Alert, AlertDescription } from "@/components/ui/alert"

import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase.config'
import { signInWithEmailAndPassword, signOut } from "firebase/auth"

import { AuthState } from '../types/auth'
import { UserInformation } from '../types/user'

export default function AuthPopup({ onLogin, detected = false }: { onLogin: (authState: AuthState, userInfo: UserInformation) => void, detected?: boolean }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Login successful:', user);

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userName = userData?.name || 'Unknown User';

        onLogin({
          isLoggedIn: true,
          token: await user.getIdToken(),
          uid: user.uid,
          pending: false,
          error: null,
        }, {
          uid: user.uid,
          name: userName,
          email: user.email,
        });
      } else {
        console.log('No such user document! Logging out...');

        await signOut(auth);
        onLogin({
          isLoggedIn: false,
          token: null,
          uid: null,
          pending: false,
          error: 'User document not found.',
        }, {
          uid: null,
          name: null,
          email: null,
        });

        setError('Account setup is incomplete. Please contact support.');
      }
    } catch (err) {
      setError("Invalid email or password. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[350px] min-h-[300px] max-h-[600px] rounded-none shadow-none flex flex-col">
      <PromptHeader />

      <CardContent className="flex-grow p-4 flex flex-col justify-center">
        {detected ? (
          <Alert className="mb-4 bg-emerald-50 border-emerald-200">
            <AlertDescription className="text-center font-medium">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-green-500 animate-pulse">
                Oops! Impulse alert! 🚨 Log in to unleash your financial superhero! 💪
              </span>
            </AlertDescription>
          </Alert>
        ) : (
          <p className="text-center text-sm font-medium mb-4 text-emerald-700">
            Let's make smart financial decisions together.
          </p>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-3">
          <div className="relative">
            <Input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-8 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 placeholder-gray-400"
              required
              disabled={isLoading}
            />
            <Mail className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <div className="relative">
            <Input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-8 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 placeholder-gray-400"
              required
              disabled={isLoading}
            />
            <Lock className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              'Log In'
            )}
          </Button>
        </form>
        <div className="mt-3 flex flex-col items-center space-y-2 text-sm">
          <a href="/forgot-password" className="text-emerald-600 hover:text-emerald-700">
            Forgot your password?
          </a>
          <p className="text-gray-600">
            Don't have an account?{' '}
            <a href="https://hesto.org/signup" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Sign up
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
