import React, { useEffect, useState } from 'react';
import { Trophy, Medal } from 'lucide-react';
import { motion } from 'motion/react';
import { apiGetLeaderboard } from '../services/apiService';
import { useLanguage } from '../context/LanguageContext';

interface LeaderboardItem {
  rank: number;
  userId: string;
  displayName: string;
  score: number;
  duration: number;
  quizCount: number;
  isCurrentUser: boolean;
}

export const Leaderboard: React.FC = () => {
  const [list, setList] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await apiGetLeaderboard();
        setList(data);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-8 h-8 text-amber-500 fill-amber-500/20" />;
      case 2: return <Medal className="w-7 h-7 text-slate-400 fill-slate-400/20" />;
      case 3: return <Medal className="w-7 h-7 text-amber-700 fill-amber-700/20" />;
      default: return <span className="font-bold text-slate-400 dark:text-slate-500 w-8 text-center text-lg">{rank}</span>;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-3xl mx-auto space-y-8"
    >
      <div className="text-center space-y-2">
        <motion.div variants={itemVariants} className="inline-flex items-center justify-center p-3 bg-amber-50 dark:bg-amber-500/10 rounded-2xl mb-2">
          <Trophy className="w-8 h-8 text-amber-500" />
        </motion.div>
        <motion.h3 variants={itemVariants} className="text-3xl font-bold font-serif-title bg-gradient-to-r from-indigo-500 to-teal-500 bg-clip-text text-transparent">
          Bảng Xếp Hạng Tuần
        </motion.h3>
        <motion.p variants={itemVariants} className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Thi đua học tập - Điểm xếp hạng reset vào mỗi thứ hai
        </motion.p>
      </div>

      <motion.div variants={itemVariants} className="bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none"></div>

        {list.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <Trophy className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">Chưa có ai thi đấu trong tuần này.<br/>Hãy là người đầu tiên làm Quiz!</p>
          </div>
        ) : (
          <div className="space-y-3 relative z-10">
            {list.map((user) => (
              <motion.div
                variants={itemVariants}
                key={user.userId}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                  user.isCurrentUser
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 shadow-md shadow-indigo-500/10 scale-[1.02]'
                    : 'bg-white/80 dark:bg-slate-900/80 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 flex justify-center">
                    {getRankBadge(user.rank)}
                  </div>
                  <div>
                    <span className={`font-bold text-base ${user.isCurrentUser ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-100'}`}>
                      {user.displayName} {user.isCurrentUser && '(Bạn)'}
                    </span>
                    <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                      {user.quizCount} bài thi • {Math.round(user.duration / 60)} phút
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xl font-black ${user.isCurrentUser ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-100'}`}>
                      {user.score}
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Câu đúng</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
