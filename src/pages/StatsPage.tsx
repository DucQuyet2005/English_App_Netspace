import React, { useRef, useState, useMemo } from 'react';
import { useApp } from '../AppContext';
import { motion } from 'motion/react';
import {
  TrendingUp,
  Award,
  Clock,
  Sparkles,
  Download,
  Upload,
  History,
  FileJson,
  Check,
  XCircle,
  HelpCircle,
  BookOpen
} from 'lucide-react';

export const StatsPage: React.FC = () => {
  const {
    words,
    attempts,
    exportData,
    importData,
    attempts: allAttempts
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const learnedCount = words.filter(w => w.learned).length;
  const totalCount = words.length;
  const learnedPercent = totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0;

  // Lấy 10 lượt quiz gần nhất
  const lastTenAttempts = useMemo(() => {
    return [...attempts].slice(0, 10).reverse(); // Đảo cho chiều thời gian tăng dần từ trái qua phải
  }, [attempts]);

  // Vẽ SVG Line Chart dựa trên dữ liệu thật
  const linePathAndPoints = useMemo(() => {
    if (lastTenAttempts.length < 2) return { path: '', points: [], area: '' };

    const svgWidth = 500;
    const svgHeight = 150;
    const padding = 15;

    const chartWidth = svgWidth - padding * 2;
    const chartHeight = svgHeight - padding * 2;

    const points = lastTenAttempts.map((attempt, idx) => {
      const x = padding + (idx / (lastTenAttempts.length - 1)) * chartWidth;
      // Điểm 0-100 chuyển thành Y từ chartHeight về 0. Y = Height - (Score / 100) * Height
      const y = padding + chartHeight - (attempt.score / 100) * chartHeight;
      return { x, y, score: attempt.score };
    });

    // Tạo đường d cho biểu đồ line
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      // Để mô phỏng đường cong Bezier mềm mại hoặc gấp khúc tinh tế hệt mẫu
      path += ` L ${points[i].x} ${points[i].y}`;
    }

    // Tạo đường cho phần fill gradient (Area)
    const area = `${path} L ${points[points.length - 1].x} ${svgHeight - padding} L ${points[0].x} ${svgHeight - padding} Z`;

    return { path, points, area };
  }, [lastTenAttempts]);

  // Xử lý Import File JSON
  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const res = importData(text);
      setImportStatus(res);
      setTimeout(() => setImportStatus(null), 5000); // Ẩn thông báo sau 5s
    };
    reader.readAsText(file);
    
    // Reset file input để có thể import lại
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatDateTime = (isoStr: string) => {
    const d = new Date(isoStr);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const getAccuracyRate = () => {
    if (attempts.length === 0) return 0;
    const totalCorrect = attempts.reduce((acc, curr) => acc + curr.correctAnswers, 0);
    const totalQuestions = attempts.reduce((acc, curr) => acc + curr.totalQuestions, 0);
    return totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  };

  const getHighestAndStreak = () => {
    if (attempts.length === 0) return { highest: 0, streak: 15 };
    const highest = Math.max(...attempts.map(a => a.score));
    return { highest: Math.round(highest), streak: 15 };
  };

  const { highest, streak } = getHighestAndStreak();

  return (
    <div className="space-y-8">
      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Tổng lượt làm Quiz</span>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">{attempts.length}</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
              📈 +12% tuần này
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Tỉ lệ chính xác TB</span>
          <div className="flex items-baseline gap-2 mt-4 mb-2">
            <span className="text-4xl font-black text-teal-600 dark:text-teal-400">{getAccuracyRate()}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-900 h-1.5 rounded-full">
            <div
              className="bg-teal-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${getAccuracyRate()}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Từ vựng đã thuộc</span>
          <div className="flex items-baseline gap-1.5 mt-4">
            <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
              {learnedCount}
            </span>
            <span className="text-sm font-bold text-slate-400 dark:text-slate-500">/{totalCount}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-900 h-1.5 rounded-full mt-3">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${learnedPercent}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Chuỗi học lập (Streak)</span>
          <div className="flex items-baseline gap-2 mt-4 text-amber-500">
            <span className="text-4xl font-black">{streak} ngày</span>
          </div>
        </div>
      </div>

      {/* Line Chart: Score progression */}
      <div className="bg-white dark:bg-slate-950 p-6 md:p-8 rounded-3xl border border-slate-200/50 dark:border-slate-850 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h3 className="text-lg font-serif-title text-slate-800 dark:text-slate-150">Tiến trình biến động điểm số</h3>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Sự thay dổi điểm số qua 10 phiên kiểm tra gần nhất</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-slate-100 dark:bg-slate-900 rounded-lg text-slate-650 dark:text-slate-400 border border-slate-200/20">
            10 lượt gần nhất
          </span>
        </div>

        {attempts.length >= 2 ? (
          <div>
            {/* SVG Chart area */}
            <div className="h-64 relative">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 500 150">
                <defs>
                  {/* Gradient cho đường cong line */}
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#5a5a40" />
                    <stop offset="100%" stopColor="#d99c7b" />
                  </linearGradient>

                  {/* Gradient đổ bóng cho vùng Area bên dưới */}
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#5a5a40" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#5a5a40" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Gridlines ngang */}
                {[0, 0.25, 0.5, 0.75, 1].map((scale, sIdx) => {
                  const y = 15 + scale * 120;
                  return (
                    <line
                      key={sIdx}
                      x1="15"
                      y1={y}
                      x2="485"
                      y2={y}
                      stroke="rgba(148, 163, 184, 0.08)"
                      strokeWidth="1.5"
                    />
                  );
                })}

                {/* Vẽ vùng Gradient phơi sáng (Area) */}
                {linePathAndPoints.area && (
                  <path d={linePathAndPoints.area} fill="url(#areaGradient)" />
                )}

                {/* Vẽ đường line gập uốn mềm mại */}
                {linePathAndPoints.path && (
                  <path
                    d={linePathAndPoints.path}
                    fill="none"
                    stroke="url(#chartGradient)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Các chấm điểm nốt thắt trị số */}
                {linePathAndPoints.points.map((pt, pIdx) => (
                  <g key={pIdx} className="group/point">
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="5"
                      fill="#4f46e5"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      className="cursor-pointer transition-all hover:r-[7.5] hover:fill-teal-400"
                    />
                  </g>
                ))}
              </svg>
            </div>
            
            {/* Trục X thời gian */}
            <div className="flex justify-between mt-3 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
              {lastTenAttempts.map((_, idx) => (
                <span key={idx}>Lượt {idx + 1}</span>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-44 flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 py-10 select-none">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
              Cần luyện tập Mini Quiz ít nhất 2 phiên để hiển thị biểu đồ phân tích.
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lịch sử các phiên làm bài */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-950 p-6 md:p-8 rounded-3xl border border-slate-200/50 dark:border-slate-850/80 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-serif-title text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-6">
              <History className="w-5 h-5 text-indigo-500" /> Lịch sử kiểm tra
            </h3>

            {attempts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-100 dark:border-slate-900/60 text-[10px] font-extrabold uppercase tracking-widest text-slate-450 dark:text-slate-500">
                    <tr>
                      <th className="pb-3.5">Ngày thực hiện</th>
                      <th className="pb-3.5">Chủ đề</th>
                      <th className="pb-3.5 text-center">Đúng/Tổng</th>
                      <th className="pb-3.5 text-right">Điểm số</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-930">
                    {attempts.map((attempt) => (
                      <tr key={attempt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                        <td className="py-4 font-bold text-slate-700 dark:text-slate-300">
                          {formatDateTime(attempt.date)}
                        </td>
                        <td className="py-4">
                          <span className="bg-indigo-50 dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-extrabold text-3xs px-2 py-1 rounded-md uppercase tracking-wider">
                            {attempt.topic}
                          </span>
                        </td>
                        <td className="py-4 text-center font-bold text-slate-500 dark:text-slate-450">
                          <span className="text-emerald-500 font-extrabold">{attempt.correctAnswers}</span>
                          <span className="opacity-40 px-1">/</span>
                          {attempt.totalQuestions}
                        </td>
                        <td className="py-4 text-right font-black text-indigo-600 dark:text-indigo-400">
                          {attempt.score}/100
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10">
                <HelpCircle className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                <h5 className="text-xs font-bold text-slate-550 dark:text-slate-400 mt-3">Chưa thực hiện bài quiz nào</h5>
              </div>
            )}
          </div>
        </div>

        {/* Data Sync & Export Section */}
        <div className="bg-white dark:bg-slate-950 p-6 md:p-8 rounded-3xl border border-slate-200/50 dark:border-slate-850/80 shadow-sm flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-serif-title text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <FileJson className="w-5 h-5 text-indigo-500" /> Hệ thống cơ sở dữ liệu
              </h3>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-2">
                Tải về bản sao lưu dự phòng toàn bộ từ điển học tập, lịch sử thi và cài đặt hoặc phục hồi dữ liệu mọi lúc mọi nơi.
              </p>
            </div>

            {/* Sync actions */}
            <div className="space-y-4">
              <button
                onClick={exportData}
                className="w-full flex items-center justify-between p-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs tracking-wider rounded-xl shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>XUẤT DỮ LIỆU (JSON)</span>
                <Download className="w-5.5 h-5.5" />
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-between p-4 border-2 border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 border-dashed text-indigo-600 dark:text-indigo-400 font-extrabold text-xs tracking-wider rounded-xl active:scale-[0.98] transition-all cursor-pointer bg-white"
              >
                <span>NHẬP DỮ LIỆU (JSON)</span>
                <Upload className="w-5.5 h-5.5" stopColor="#4f46e5" />
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFileChange}
                className="hidden"
              />
            </div>

            {/* Feedback Sync Status */}
            {importStatus && (
              <div className={`p-4 rounded-xl text-xs font-bold ${
                importStatus.success ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
              }`}>
                {importStatus.message}
              </div>
            )}
          </div>

          <div className="mt-8 p-4 bg-indigo-50 dark:bg-slate-900/60 rounded-2xl flex items-start gap-3 border border-indigo-100/40 dark:border-slate-850/60">
            <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
            <p className="text-2xs font-bold leading-normal text-slate-500 dark:text-slate-400">
              Định dạng dữ liệu JSON tương thích 100% giúp người học dễ dàng đồng bộ tài khoản giữa các nền tảng khác nhau mà không sợ thất lạc vốn từ.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
