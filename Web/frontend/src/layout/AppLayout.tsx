import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { apiClient } from "../api/services"

interface AppLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  title = "Transaction Dashboard", 
  subtitle = "Manage and track your financial transactions" 
}) => {
  const [currentUser, setCurrentUser] = useState<any | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is selected
    const sessionId = apiClient.getSessionId()
    if (!sessionId) {
      navigate("/")
      return
    }

    // Get current user info from localStorage or API
    const userData = localStorage.getItem("yaya_current_user")
    if (userData) {
      setCurrentUser(JSON.parse(userData))
    }

    // Listen for user changes across the app
    const handleUserChanged = () => {
      const updated = localStorage.getItem("yaya_current_user")
      if (updated) {
        setCurrentUser(JSON.parse(updated))
      } else {
        setCurrentUser(null)
      }
    }
    window.addEventListener('yaya:user-changed', handleUserChanged)
    return () => window.removeEventListener('yaya:user-changed', handleUserChanged)
  }, [navigate])

  const handleUserChange = () => {
    apiClient.setSessionId("")
    localStorage.removeItem("yaya_session_id")
    localStorage.removeItem("yaya_current_user")
    window.dispatchEvent(new CustomEvent('yaya:user-changed'))
    navigate("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 text-balance">{title}</h1>
              <p className="text-slate-600 text-sm mt-1">{subtitle}</p>
            </div>

            {currentUser && (
              <Card className="w-full sm:w-auto">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {(currentUser.Name || "?")
                          .split(" ")
                          .map((n: string) => n.charAt(0))
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 truncate">{currentUser.Name}</div>
                      <div className="text-sm text-slate-500 truncate">@{currentUser.Account}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleUserChange}
                      className="text-slate-600 hover:text-slate-900"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="hidden sm:inline ml-2">Switch</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </header>

      <main>
        {children}
      </main>
    </div>
  )
}

export default AppLayout
