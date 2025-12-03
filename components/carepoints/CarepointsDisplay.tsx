import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, Coins } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export const CarePointsDisplay: React.FC = () => {
  const { user } = useAuth()

  if (!user) return null

  const growthPoints = user.carepoints || 0
  const phpValue = (growthPoints / 100).toFixed(2)
  const nextRewardProgress = (growthPoints % 100)

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-emerald-500" />
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
            <span className="font-semibold">₱{phpValue}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress to next ₱1</span>
            <span>{nextRewardProgress}/100</span>
          </div>
          <Progress value={nextRewardProgress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-2 bg-emerald-50 rounded border border-emerald-200">
            <div className="font-semibold text-emerald-700">Create Post</div>
            <div className="text-emerald-600">+10 points</div>
          </div>
          <div className="text-center p-2 bg-teal-50 rounded border border-teal-200">
            <div className="font-semibold text-teal-700">Add Comment</div>
            <div className="text-teal-600">+5 points</div>
          </div>
          <div className="text-center p-2 bg-cyan-50 rounded border border-cyan-200">
            <div className="font-semibold text-cyan-700">React to Post</div>
            <div className="text-cyan-600">+2 points</div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded border border-blue-200">
            <div className="font-semibold text-blue-700">Share Content</div>
            <div className="text-blue-600">+3 points</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
