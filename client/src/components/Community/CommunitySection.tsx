import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';

interface Challenge {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'upcoming';
  progress: number;
  daysRemaining: number;
  participants: number;
}

interface LeaderboardUser {
  id: string;
  name: string;
  points: number;
  rank: number;
  avatar?: string;
  achievements: string[];
}

interface FeedPost {
  id: string;
  author: {
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: Date;
  likes: number;
  comments: number;
}

export const CommunitySection: React.FC = () => {
  const { isAuthenticated, userProfile } = useAuth();
  
  // Fetch community data
  const { data: challenges = [], isLoading: challengesLoading } = useQuery({
    queryKey: ['/api/community/challenges'],
    enabled: isAuthenticated,
  });

  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery({
    queryKey: ['/api/community/leaderboard'],
    enabled: isAuthenticated,
  });

  const { data: feedPosts = [], isLoading: feedLoading } = useQuery({
    queryKey: ['/api/community/feed'],
    enabled: isAuthenticated,
  });

  // Mock data for demonstration (replace with real API calls)
  const [activeChallenges] = useState<Challenge[]>([
    {
      id: '1',
      name: 'Zero Waste Week',
      description: 'Reduce waste to zero for 7 consecutive days',
      status: 'active',
      progress: 68,
      daysRemaining: 5,
      participants: 1247
    },
    {
      id: '2',
      name: 'Energy Saver Month',
      description: 'Reduce energy consumption by 20%',
      status: 'active',
      progress: 45,
      daysRemaining: 18,
      participants: 892
    }
  ]);

  const [topUsers] = useState<LeaderboardUser[]>([
    {
      id: '1',
      name: 'Sarah Green',
      points: 2450,
      rank: 1,
      achievements: ['champion', 'eco-warrior']
    },
    {
      id: '2',
      name: 'Mike Chen',
      points: 2340,
      rank: 2,
      achievements: ['consistent', 'innovator']
    },
    {
      id: '3',
      name: 'Alex Earth',
      points: 2180,
      rank: 3,
      achievements: ['leader', 'mentor']
    }
  ]);

  const [recentPosts] = useState<FeedPost[]>([
    {
      id: '1',
      author: { name: 'Emma Sustainable' },
      content: 'Just completed my first plastic-free week! 🌱',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      likes: 24,
      comments: 8
    },
    {
      id: '2',
      author: { name: 'David EcoWarrior' },
      content: 'Reduced my carbon footprint by 30% this month!',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      likes: 31,
      comments: 12
    }
  ]);

  const handleJoinChallenge = (challengeId: string) => {
    console.log(`Joining challenge: ${challengeId}`);
    // Implementation would make API call to join challenge
  };

  const handleViewLeaderboard = () => {
    console.log('Opening full leaderboard...');
    // Implementation would open detailed leaderboard view
  };

  const handleShareUpdate = () => {
    console.log('Opening share dialog...');
    // Implementation would open social sharing form
  };

  const formatTimeAgo = (timestamp: Date) => {
    const hours = Math.floor((Date.now() - timestamp.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return 'fas fa-crown text-solar';
      case 2: return 'fas fa-medal text-tech-blue';
      case 3: return 'fas fa-award text-electric-purple';
      default: return 'fas fa-user text-white/60';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-eco-primary/20 text-eco-primary';
      case 'completed': return 'bg-tech-blue/20 text-tech-blue';
      case 'upcoming': return 'bg-solar/20 text-solar';
      default: return 'bg-white/10 text-white/60';
    }
  };

  // if (!isAuthenticated) {
  //   return (
  //     <section className="py-20 px-6" id="community">
  //       <div className="container mx-auto max-w-6xl text-center">
  //         <div className="glass-morphism rounded-3xl p-12">
  //           <i className="fas fa-users text-6xl text-white/30 mb-6" aria-hidden="true"></i>
  //           <h2 className="text-3xl font-bold mb-4">Join the Eco Community</h2>
  //           <p className="text-white/70 mb-8">
  //             Connect with like-minded individuals and participate in environmental challenges
  //           </p>
  //           <Button className="glass-morphism-eco hover:bg-eco-primary/30">
  //             <i className="fas fa-sign-in-alt mr-2" aria-hidden="true"></i>
  //             Sign In to Join
  //           </Button>
  //         </div>
  //       </div>
  //     </section>
  //   );
  // }

  return (
    <section className="py-20 px-6" id="community">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 glow-text">Global Eco Community</h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Connect with environmentally conscious individuals worldwide and share your sustainability journey
          </p>
        </div>

        {/* Community Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Eco Challenges */}
          <div className="glass-morphism rounded-3xl p-6">
            <div className="w-16 h-16 glass-morphism-eco rounded-2xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-trophy text-3xl text-solar" aria-hidden="true"></i>
            </div>
            <h3 className="text-xl font-bold text-center mb-4">Eco Challenges</h3>
            <p className="text-white/70 text-center mb-6">
              Join monthly challenges and compete with friends to reduce your environmental footprint.
            </p>
            
            {/* Active Challenges */}
            <div className="space-y-4 mb-6">
              {activeChallenges.map((challenge) => (
                <div key={challenge.id} className="glass-morphism-dark rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">{challenge.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(challenge.status)}`}>
                      {challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-xs text-white/60 mb-2">
                    {challenge.daysRemaining} days remaining • {challenge.participants.toLocaleString()} participants
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-solar h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${challenge.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-xs text-white/60 mt-1">
                    {challenge.progress}% complete
                  </div>
                </div>
              ))}
            </div>
            
            <Button 
              onClick={() => handleJoinChallenge('new')}
              className="w-full glass-morphism-eco hover:bg-eco-primary/30 focus:outline-none focus:ring-2 focus:ring-eco-primary/50"
            >
              <i className="fas fa-plus mr-2" aria-hidden="true"></i>
              Join New Challenge
            </Button>
          </div>

          {/* Leaderboard */}
          <div className="glass-morphism rounded-3xl p-6">
            <div className="w-16 h-16 glass-morphism-eco rounded-2xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-medal text-3xl text-eco-primary" aria-hidden="true"></i>
            </div>
            <h3 className="text-xl font-bold text-center mb-4">Leaderboard</h3>
            <p className="text-white/70 text-center mb-6">
              See how you rank among eco-warriors in your region and globally.
            </p>
            
            {/* Top Users */}
            <div className="space-y-3 mb-6">
              {topUsers.map((user) => (
                <div key={user.id} className="glass-morphism-dark rounded-xl p-3 flex items-center space-x-3 hover:bg-white/5 transition-colors">
                  <div className={`w-8 h-8 rounded-full ${
                    user.rank <= 3 
                      ? 'bg-gradient-to-r from-eco-primary to-tech-blue' 
                      : 'bg-white/20'
                  } flex items-center justify-center text-xs font-bold`}>
                    {user.rank}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{user.name}</div>
                    <div className="text-xs text-white/60">
                      {user.points.toLocaleString()} points
                    </div>
                  </div>
                  <i className={getRankIcon(user.rank)} aria-hidden="true"></i>
                </div>
              ))}
            </div>
            
            <Button 
              onClick={handleViewLeaderboard}
              className="w-full glass-morphism-eco hover:bg-eco-primary/30 focus:outline-none focus:ring-2 focus:ring-eco-primary/50"
            >
              <i className="fas fa-list mr-2" aria-hidden="true"></i>
              View Full Leaderboard
            </Button>
          </div>

          {/* Social Feed */}
          <div className="glass-morphism rounded-3xl p-6">
            <div className="w-16 h-16 glass-morphism-eco rounded-2xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-users text-3xl text-tech-blue" aria-hidden="true"></i>
            </div>
            <h3 className="text-xl font-bold text-center mb-4">Community Feed</h3>
            <p className="text-white/70 text-center mb-6">
              Share your eco-achievements and get inspired by others' sustainability stories.
            </p>
            
            {/* Recent Posts */}
            <div className="space-y-3 mb-6">
              {recentPosts.map((post) => (
                <div key={post.id} className="glass-morphism-dark rounded-xl p-3 hover:bg-white/5 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-eco-primary to-tech-blue flex-shrink-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {post.author.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold mb-1">{post.author.name}</div>
                      <div className="text-xs text-white/80 mb-2 break-words">{post.content}</div>
                      <div className="flex items-center space-x-4 text-xs text-white/50">
                        <span>{formatTimeAgo(post.timestamp)}</span>
                        <button className="hover:text-eco-primary transition-colors focus:outline-none">
                          <i className="fas fa-heart mr-1" aria-hidden="true"></i>
                          {post.likes}
                        </button>
                        <button className="hover:text-tech-blue transition-colors focus:outline-none">
                          <i className="fas fa-comment mr-1" aria-hidden="true"></i>
                          {post.comments}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <Button 
              onClick={handleShareUpdate}
              className="w-full glass-morphism-eco hover:bg-eco-primary/30 focus:outline-none focus:ring-2 focus:ring-eco-primary/50"
            >
              <i className="fas fa-share mr-2" aria-hidden="true"></i>
              Share Update
            </Button>
          </div>
        </div>

        {/* Community Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-morphism rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-eco-primary mb-2">2.5M+</div>
            <div className="text-white/70 text-sm">Community Members</div>
          </div>
          <div className="glass-morphism rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-tech-blue mb-2">180K</div>
            <div className="text-white/70 text-sm">Challenges Completed</div>
          </div>
          <div className="glass-morphism rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-solar mb-2">95%</div>
            <div className="text-white/70 text-sm">Goal Achievement</div>
          </div>
          <div className="glass-morphism rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-electric-purple mb-2">24/7</div>
            <div className="text-white/70 text-sm">Community Support</div>
          </div>
        </div>
      </div>
    </section>
  );
};
