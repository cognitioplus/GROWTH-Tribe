import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Comment } from '@/lib/supabase'
import { Loader2, Send } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ReactionButton } from '../reactions/ReactionButton'
import toast from 'react-hot-toast'

interface CommentSectionProps {
  postId: string
  comments: Comment[]
  onCommentAdded: () => void
}

export const CommentSection: React.FC<CommentSectionProps> = ({ 
  postId, 
  comments, 
  onCommentAdded 
}) => {
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, updateCarePoints } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newComment.trim()) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('comments')
        .insert([
          {
            post_id: postId,
            user_id: user.id,
            content: newComment.trim()
          }
        ])

      if (error) throw error

      // Award CarePoints for commenting
      await updateCarePoints(5, 'create_comment', 'Added a comment')

      setNewComment('')
      onCommentAdded()
      toast.success('Comment added!')
    } catch (error) {
      console.error('Error creating comment:', error)
      toast.error('Failed to add comment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 pt-4 border-t">
      {/* Comment Form */}
      {user && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex space-x-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback>
                {user.full_name?.charAt(0) || user.username?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Share your thoughts..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
                maxLength={1000}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button 
              type="submit" 
              size="sm" 
              disabled={loading || !newComment.trim()}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Comment (+5 CarePoints)
            </Button>
          </div>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="flex space-x-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={comment.user?.avatar_url} />
              <AvatarFallback>
                {comment.user?.full_name?.charAt(0) || comment.user?.username?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-sm">
                    {comment.user?.full_name || comment.user?.username}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
              </div>
              <div className="flex items-center">
                <ReactionButton 
                  commentId={comment.id}
                  reactions={comment.reactions || []}
                  onReactionAdded={onCommentAdded}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
