import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { PostList } from '@/components/forum/PostList'
import { CreatePost } from '@/components/forum/CreatePost'
import { UserProfile } from '@/components/profile/UserProfile'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, Plus, User, LogOut, TrendingUp, Award, Target, Calendar } from 'lucide-react'

export default function MainApp() {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('home')

  if (!user) return null

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  // Calculate user stats
  const growthPoints = user.carepoints || 0
  const phpValue = (growthPoints / 100).toFixed(2)
  const joinedDate = new Date(user.created_at).toLocaleDateString()
  const daysActive = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Personalized Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="https://appimize.app/assets/apps/user_1097/images/2d5cb5dadead_225_1097.png" 
                alt="GROWTH Tribe Logo" 
                className="w-10 h-10 rounded-lg"
              />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  GROWTH Tribe
                </h1>
                <p className="text-xs text-gray-500">Welcome back, {user.full_name?.split(' ')[0] || user.username}!</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <Badge variant="secondary" className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700">
                  {growthPoints} Growth Points
                </Badge>
                <span className="text-sm text-gray-500">≈ ₱{phpValue}</span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-gray-600 hover:text-emerald-600"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="home" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-6">
            {/* Personalized Dashboard Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Your Growth Journey, {user.full_name?.split(' ')[0] || user.username}! 🌱
              </h1>
              <p className="text-gray-600">
                Track your progress and connect with the community
              </p>
            </div>

            {/* Personalized Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-emerald-700">
                    <Award className="h-5 w-5" />
                    <span>Growth Points</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-800">{growthPoints}</div>
                  <p className="text-sm text-emerald-600">Worth ₱{phpValue} PHP</p>
                  <div className="mt-2 text-xs text-emerald-600">
                    Progress to next ₱1: {growthPoints % 100}/100
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-teal-700">
                    <Target className="h-5 w-5" />
                    <span>Community Impact</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-teal-800">
                    {Math.floor(growthPoints / 10)}
                  </div>
                  <p className="text-sm text-teal-600">Posts & Interactions</p>
                  <div className="mt-2 text-xs text-teal-600">
                    Keep sharing to grow!
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-cyan-700">
                    <Calendar className="h-5 w-5" />
                    <span>Journey Time</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-cyan-800">{daysActive}</div>
                  <p className="text-sm text-cyan-600">Days Active</p>
                  <div className="mt-2 text-xs text-cyan-600">
                    Since {joinedDate}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Growth Points Earning Guide */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">How to Earn Growth Points</CardTitle>
                <CardDescription>Every action contributes to your growth journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <div className="font-semibold text-emerald-700">Create Post</div>
                    <div className="text-emerald-600 font-bold">+10 points</div>
                  </div>
                  <div className="text-center p-3 bg-teal-50 rounded-lg">
                    <div className="font-semibold text-teal-700">Add Comment</div>
                    <div className="text-teal-600 font-bold">+5 points</div>
                  </div>
                  <div className="text-center p-3 bg-cyan-50 rounded-lg">
                    <div className="font-semibold text-cyan-700">React to Post</div>
                    <div className="text-cyan-600 font-bold">+2 points</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="font-semibold text-blue-700">Share Content</div>
                    <div className="text-blue-600 font-bold">+3 points</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Community Posts */}
            <PostList />
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Share Your Growth Story 📝
              </h1>
              <p className="text-gray-600">
                Create a post and earn 10 Growth Points for sharing your experience
              </p>
            </div>
            <CreatePost onPostCreated={() => setActiveTab('home')} />
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <UserProfile />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
