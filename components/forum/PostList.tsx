import React, { useEffect, useState } from 'react'
import { supabase, Post } from '@/lib/supabase'
import { PostCard } from './PostCard'
import { CreatePost } from './CreatePost'
import { Loader2 } from 'lucide-react'

export const PostList: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:users(*),
          comments(
            *,
            user:users(*),
            reactions(*)
          ),
          reactions(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchPosts()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => {
        fetchPosts()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reactions' }, () => {
        fetchPosts()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <CreatePost onPostCreated={fetchPosts} />
      
      {posts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onPostUpdated={fetchPosts}
            onPostDeleted={fetchPosts}
          />
        ))
      )}
    </div>
  )
}
