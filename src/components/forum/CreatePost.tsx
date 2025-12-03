import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface CreatePostProps {
  onPostCreated: () => void
}

export const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const { user, updateCarePoints } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('posts')
        .insert([
          {
            user_id: user.id,
            title: title.trim(),
            content: content.trim()
          }
        ])

      if (error) throw error

      // Award Growth Points for creating a post
      await updateCarePoints(10, 'create_post', 'Created a new post')

      setTitle('')
      setContent('')
      setShowForm(false)
      onPostCreated()
      toast.success('Post created successfully! You earned 10 Growth Points!')
    } catch (error) {
      console.error('Error creating post:', error)
      toast.error('Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  if (!showForm) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <Button 
            onClick={() => setShowForm(true)} 
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            variant="default"
          >
            <Plus className="mr-2 h-4 w-4" />
            Share your growth journey with the community
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Share Your Growth Story</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="What's your growth story about?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
            />
          </div>
          <div>
            <Textarea
              placeholder="Share your insights, experiences, challenges overcome, lessons learned, or questions about personal growth, resilience, well-being, transformation, and finding harmony in life..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={4}
              maxLength={2000}
            />
          </div>
          <div className="flex space-x-2">
            <Button 
              type="submit" 
              disabled={loading || !title.trim() || !content.trim()}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Share Story (+10 Growth Points)
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
