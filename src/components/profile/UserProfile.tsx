import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/AuthContext'
import { TrendingUp, Calendar, User, Award, Target, Coins } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export const UserProfile: React.FC = () => {
  const { user } = useAuth()

  if (!user) return null

  const growthPoints = user.carepoints || 0
  const phpValue = (growthPoints / 100).toFixed(2)
  const nextRewardProgress = (growthPoints % 100)
  const joinedDate = new Date(user.created_at)
  const daysActive = Math.floor((Date.now() - joinedDate.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Your Growth Profile</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback className="text-2xl bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700">
                {user.full_name?.charAt(0) || user.username?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h3 className="font-bold text-2xl text-gray-800">{user.full_name}</h3>
              <p className="text-gray-600">@{user.username}</p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <Badge variant="secondary" className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700">
                    {growthPoints} Growth Points
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 text-green-600">
                  <Coins className="h-4 w-4" />
                  <span className="font-semibold">₱{phpValue}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>
                Joined {formatDistanceToNow(joinedDate, { addSuffix: true })}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Target className="h-4 w-4" />
              <span>{daysActive} days on your growth journey</span>
            </div>
            <div className="text-sm text-gray-600">
              <span>📧 {user.email}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Growth Points Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-emerald-500" />
            <span>Your Growth Points</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-lg px-3 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700">
                {growthPoints} Growth Points
              </Badge>
            </div>
            <div className="flex items-center space-x-2 text-green-600">
              <Coins className="h-4 w-4" />
              <span className="font-semibold">₱{phpValue} PHP</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to next ₱1</span>
              <span>{nextRewardProgress}/100</span>
            </div>
            <Progress value={nextRewardProgress} className="h-3" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="font-semibold text-emerald-700">Create Post</div>
              <div className="text-emerald-600 font-bold">+10 points</div>
            </div>
            <div className="text-center p-3 bg-teal-50 rounded-lg border border-teal-200">
              <div className="font-semibold text-teal-700">Add Comment</div>
              <div className="text-teal-600 font-bold">+5 points</div>
            </div>
            <div className="text-center p-3 bg-cyan-50 rounded-lg border border-cyan-200">
              <div className="font-semibold text-cyan-700">React to Post</div>
              <div className="text-cyan-600 font-bold">+2 points</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="font-semibold text-blue-700">Share Content</div>
              <div className="text-blue-600 font-bold">+3 points</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Growth Journey */}
      <Card>
        <CardHeader>
          <CardTitle>Your GROWTH Journey</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
              <div className="text-2xl font-bold text-emerald-700">{Math.floor(growthPoints / 10)}</div>
              <div className="text-sm text-emerald-600">Stories Shared</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg border border-teal-200">
              <div className="text-2xl font-bold text-teal-700">{Math.floor(growthPoints / 5)}</div>
              <div className="text-sm text-teal-600">Community Interactions</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg border border-cyan-200">
              <div className="text-2xl font-bold text-cyan-700">{daysActive}</div>
              <div className="text-sm text-cyan-600">Days Growing</div>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-gray-600">
              Welcome to your personal growth community, <strong>{user.full_name?.split(' ')[0] || user.username}</strong>! 
              You've been on this journey for {daysActive} days, earning {growthPoints} Growth Points through meaningful 
              interactions and sharing your experiences. Keep growing, learning, and inspiring others!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
