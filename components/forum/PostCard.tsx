import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { Post } from '@/lib/supabase'
import { MessageCircle, Share2, MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { CommentSection } from './CommentSection'
import { ReactionButton } from '../reactions/ReactionButton'
import { ShareButton } from '../social/ShareButton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface PostCardProps {
  post: Post
  onPostUpdated: () => void
  onPostDeleted: () => void
}

export const PostCard: React.FC<PostCardProps> = ({ post, onPostUpdated, onPostDeleted }) => {
  const [showComments, setShowComments] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const { user } = useAuth()

  const isOwner = user?.id === post.user_id

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return
    // Delete logic will be implemented
    onPostDeleted()
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.user?.avatar_url} />
              <AvatarFallback>
                {post.user?.full_name?.charAt(0) || post.user?.username?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{post.user?.full_name || post.user?.username}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center space-x-4">
              <ReactionButton 
                postId={post.id} 
                reactions={post.reactions || []}
                onReactionAdded={onPostUpdated}
              />
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowComments(!showComments)}
                className="text-muted-foreground hover:text-foreground"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                {post.comments?.length || 0}
              </Button>
            </div>

            <ShareButton 
              title={post.title}
              content={post.content}
              url={`${window.location.origin}/post/${post.id}`}
            />
          </div>

          {showComments && (
            <CommentSection 
              postId={post.id} 
              comments={post.comments || []}
              onCommentAdded={onPostUpdated}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
