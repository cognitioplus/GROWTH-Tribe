import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Users, Trophy, Share2, MessageCircle, Star } from 'lucide-react'

interface LandingProps {
  onShowLogin: () => void
  onShowSignup: () => void
}

export default function Landing({ onShowLogin, onShowSignup }: LandingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="https://appimize.app/assets/apps/user_1097/images/2d5cb5dadead_225_1097.png" 
              alt="GROWTH Tribe Logo" 
              className="w-10 h-10 rounded-lg"
            />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              GROWTH Tribe
            </h1>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onShowLogin}>
              Login
            </Button>
            <Button onClick={onShowSignup} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
              Join Now
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-6 bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
            🌱 Personal Growth Community
          </Badge>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent leading-tight">
            Grow Together, Thrive Forever
          </h2>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join a supportive community where personal growth meets meaningful connections. 
            Share your journey, earn Growth Points, and inspire others on their path to success.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={onShowSignup}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-lg px-8 py-6"
            >
              Start Your Journey
              <TrendingUp className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={onShowLogin}
              className="text-lg px-8 py-6 border-emerald-300 hover:bg-emerald-50"
            >
              Welcome Back
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-800 mb-4">
            Why Choose GROWTH Tribe?
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Experience a platform designed to nurture your personal development while building lasting connections.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-emerald-700">Supportive Community</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-gray-600">
                Connect with like-minded individuals who share your passion for growth. 
                Share experiences, get advice, and build meaningful relationships.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-teal-700">Growth Points Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-gray-600">
                Earn Growth Points for every contribution! Create posts, comment, and react to content. 
                100 Growth Points = ₱1 PHP in real value.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-cyan-700">Share & Inspire</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-gray-600">
                Share your growth stories across social platforms. Inspire others with your journey 
                and amplify positive impact in the world.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-16 bg-white/50 backdrop-blur-sm rounded-3xl mx-4">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-800 mb-4">
            How It Works
          </h3>
          <p className="text-gray-600">
            Simple steps to start your growth journey
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              1
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">Join the Community</h4>
            <p className="text-gray-600 text-sm">
              Sign up and create your profile to become part of our growing family
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-teal-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              2
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">Share & Engage</h4>
            <p className="text-gray-600 text-sm">
              Post your thoughts, comment on others' stories, and react with emojis
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-cyan-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              3
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">Earn Growth Points</h4>
            <p className="text-gray-600 text-sm">
              Get rewarded for your contributions and watch your impact grow
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-emerald-600 mb-2">1000+</div>
            <div className="text-gray-600">Community Members</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-teal-600 mb-2">5000+</div>
            <div className="text-gray-600">Growth Stories</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-cyan-600 mb-2">50K+</div>
            <div className="text-gray-600">Growth Points Earned</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
            <div className="text-gray-600">Support Available</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-12 text-white">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Transform Your Life?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of individuals who are already growing together in our supportive community.
          </p>
          <Button 
            size="lg" 
            onClick={onShowSignup}
            className="bg-white text-emerald-600 hover:bg-gray-100 text-lg px-8 py-6"
          >
            Join GROWTH Tribe Today
            <Star className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-600">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <img 
            src="https://appimize.app/assets/apps/user_1097/images/2d5cb5dadead_225_1097.png" 
            alt="GROWTH Tribe Logo" 
            className="w-6 h-6 rounded"
          />
          <span className="font-semibold">GROWTH Tribe</span>
        </div>
        <p className="text-sm">
          © 2024 GROWTH Tribe. Empowering personal growth through community connection.
        </p>
      </footer>
    </div>
  )
}
