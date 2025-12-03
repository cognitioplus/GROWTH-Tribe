import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Reaction } from '@/lib/supabase'
import { Heart, Smile } from 'lucide-react'
import toast from 'react-hot-toast'

interface ReactionButtonProps {
  postId?: string
  commentId?: string
  reactions: Reaction[]
  onReactionAdded: () => void
}

const EMOJI_OPTIONS = ['❤️', '👍', '👏', '🔥', '💯', '🙏', '✨', '💪']

export const ReactionButton: React.FC<ReactionButtonProps> = ({ 
  postId, 
  commentId, 
  reactions, 
  onReactionAdded 
}) => {
  const [loading, setLoading] = useState(false)
  const { user, updateCarePoints } = useAuth()

  const userReaction = reactions.find(r => r.user_id === user?.id)
  const reactionCounts = reactions.reduce((acc, reaction) => {
    acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const handleReaction = async (emoji: string) => {
    if (!user) return

    setLoading(true)
    try {
      if (userReaction) {
        // Remove existing reaction
        const { error } = await supabase
          .from('reactions')
          .delete()
          .eq('id', userReaction.id)

        if (error) throw error
      }

      if (!userReaction || userReaction.emoji !== emoji) {
        // Add new reaction
        const { error } = await supabase
          .from('reactions')
          .insert([
            {
              user_id: user.id,
              post_id: postId,
              comment_id: commentId,
              emoji
            }
          ])

        if (error) throw error

        // Award CarePoints for reacting
        await updateCarePoints(2, 'add_reaction', 'Added a reaction')
      }

      onReactionAdded()
    } catch (error) {
      console.error('Error handling reaction:', error)
      toast.error('Failed to update reaction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-foreground"
            disabled={loading}
          >
            {userReaction ? (
              <span className="mr-1">{userReaction.emoji}</span>
            ) : (
              <Heart className="mr-1 h-4 w-4" />
            )}
            {reactions.length}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="flex space-x-1">
            {EMOJI_OPTIONS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-muted"
                onClick={() => handleReaction(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Show reaction counts */}
      {Object.entries(reactionCounts).map(([emoji, count]) => (
        <Button
          key={emoji}
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={() => handleReaction(emoji)}
        >
          {emoji} {count}
        </Button>
      ))}
    </div>
  )
}
