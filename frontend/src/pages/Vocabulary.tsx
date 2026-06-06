import React, { useState, useMemo } from 'react';
import { useApp } from '../AppContext';
import { Word } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  BookOpen,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  X,
  Tag,
  HelpCircle,
  Volume2,
  Loader2
} from 'lucide-react';

import { playPronunciation } from '../utils/audioHelper';

interface VocabularyProps {
  searchValue?: string;
  onSearchChange?: (val: string) => void;
}

export const Vocabulary: React.FC<VocabularyProps> = ({ searchValue = '', onSearchChange }) => {
  const { words, addWord, updateWord, deleteWord, toggleWordLearned } = useApp();

  const [localSearch, setLocalSearch] = useState('');
  const search = onSearchChange ? searchValue : localSearch;

  const handleSearchChange = (val: string) => {
    setLocalSearch(val);
    if (onSearchChange) {
      onSearchChange(val);
    }
  };

  const [topicFilter, setTopicFilter] = useState('Tất cả');
  const [statusFilter, setStatusFilter] = useState('Tất cả');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);

  // Audio state
  const [loadingAudioId, setLoadingAudioId] = useState<string | null>(null);

  const handlePlayAudio = async (word: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (loadingAudioId === id) return;
    setLoadingAudioId(id);
    await playPronunciation(word);
    setLoadingAudioId(null);
  };


  // Form states
  const [wordInput, setWordInput] = useState('');
  const [ipaInput, setIpaInput] = useState('');
  const [meaningInput, setMeaningInput] = useState('');
  const [exampleInput, setExampleInput] = useState('');
  const [topicInput, setTopicInput] = useState('Gia đình');
  const [learnedInput, setLearnedInput] = useState(false);

  // Hàm tự động lấy phiên âm IPA từ Free Dictionary API
  const fetchAutoIpa = async (word: string) => {
    const trimmedWord = word.trim();
    if (!trimmedWord) return;

    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(trimmedWord.toLowerCase())}`);
      if (!response.ok) return;

      const data = await response.json();
      const phonetic = data[0]?.phonetic || data[0]?.phonetics?.find((p: any) => p.text)?.text;

      if (phonetic) {
        setIpaInput(phonetic);
      }
    } catch (error) {
      console.error('Lỗi khi lấy phiên âm tự động:', error);
    }
  };

  // Thu thập danh sách chủ đề duy nhất hiện có trong dữ liệu
  const availableTopics = useMemo(() => {
    const topics = new Set(words.map(w => w.topic));
    // Luôn đảm bảo các chủ đề cốt lõi xuất hiện
    ['Gia đình', 'Công việc', 'Du lịch', 'IELTS'].forEach(t => topics.add(t));
    return Array.from(topics);
  }, [words]);

  // Bộ lọc dữ liệu tinh tế và cực kỳ nhanh nhạy
  const filteredWords = useMemo(() => {
    return words.filter(item => {
      const matchesSearch = item.word.toLowerCase().includes(search.toLowerCase()) ||
        item.meaning.toLowerCase().includes(search.toLowerCase());

      const matchesTopic = topicFilter === 'Tất cả' || item.topic === topicFilter;

      const matchesStatus = statusFilter === 'Tất cả' ||
        (statusFilter === 'Đã thuộc' && item.learned) ||
        (statusFilter === 'Chưa thuộc' && !item.learned);

      return matchesSearch && matchesTopic && matchesStatus;
    });
  }, [words, search, topicFilter, statusFilter]);

  const openAddModal = () => {
    setEditingWord(null);
    setWordInput('');
    setIpaInput('');
    setMeaningInput('');
    setExampleInput('');
    setTopicInput('Gia đình');
    setLearnedInput(false);
    setIsModalOpen(true);
  };

  const openEditModal = (word: Word, e: React.MouseEvent) => {
    e.stopPropagation(); // ngăn chặn hành vi click ngoài ý muốn
    setEditingWord(word);
    setWordInput(word.word);
    setIpaInput(word.ipa);
    setMeaningInput(word.meaning);
    setExampleInput(word.example);
    setTopicInput(word.topic);
    setLearnedInput(word.learned);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingWord(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wordInput.trim() || !meaningInput.trim()) {
      alert('Vui lòng nhập đầy đủ Từ tiếng Anh và Nghĩa tiếng Việt!');
      return;
    }

    const payload = {
      word: wordInput.trim(),
      ipa: ipaInput.trim() || '/.../',
      meaning: meaningInput.trim(),
      example: exampleInput.trim() || 'No example provided.',
      topic: topicInput,
      learned: learnedInput
    };

    if (editingWord) {
      updateWord({
        ...editingWord,
        ...payload
      });
    } else {
      addWord(payload);
    }

    handleCloseModal();
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Bạn chắc chắn muốn xóa từ vựng này khỏi từ điển của bạn?')) {
      deleteWord(id);
    }
  };

  return (
    <div className="space-y-8">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white/60 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-shadow">
        {/* Search */}
        <div className="relative flex-1 max-w-md group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm từ vựng, ý nghĩa..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 dark:focus:border-indigo-700/50 text-slate-800 dark:text-slate-200 transition-all shadow-inner"
          />
        </div>

        {/* Lọc nhanh (Chủ đề & Trạng thái) */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Chủ đề
            </span>
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm cursor-pointer"
            >
              <option value="Tất cả">Tất cả</option>
              {availableTopics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Trạng thái
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm cursor-pointer"
            >
              <option value="Tất cả">Tất cả</option>
              <option value="Đã thuộc">Đã thuộc</option>
              <option value="Chưa thuộc">Chưa thuộc</option>
            </select>
          </div>

          {/* Button thêm mới */}
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-gradient-to-tr from-indigo-600 to-indigo-500 hover:to-indigo-400 active:scale-95 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer border border-indigo-400/20"
          >
            <Plus className="w-4 h-4" />
            Thêm từ mới
          </button>
        </div>
      </div>

      {/* Grid Danh sách Từ vựng */}
      {filteredWords.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredWords.map((item) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={item.id}
              className="bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-indigo-200/50 dark:hover:border-indigo-500/30 border border-white/60 dark:border-slate-800/60 flex items-start gap-5 group transition-all duration-300 relative overflow-hidden"
            >
              {/* Thư mục biểu trưng cho chủ đề */}
              <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner relative z-10 ${item.learned
                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-800/30'
                : 'bg-indigo-50/80 dark:bg-slate-900/80 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-800/20'
                }`}>
                <BookOpen className="w-7 h-7" />
              </div>

              {/* Thông tin Chi tiết từ */}
              <div className="flex-1 min-w-0 relative z-10">
                <div className="flex items-start justify-between gap-2">
                  {/* <div className="min-w-0">
                    <h3 className="text-2xl font-serif-title text-slate-800 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.word}
                    </h3>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                      {item.ipa}
                    </p>
                  </div> */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-serif-title text-slate-800 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {item.word}
                      </h3>
                      <button
                        onClick={(e) => handlePlayAudio(item.word, item.id, e)}
                        disabled={loadingAudioId === item.id}
                        className="shrink-0 p-1.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer disabled:opacity-50"
                        title="Nghe phát âm"
                      >
                        {loadingAudioId === item.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                      {item.ipa}
                    </p>
                  </div>

                  <span className="shrink-0 bg-amber-50/80 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/30 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                    {item.topic}
                  </span>
                </div>

                <div className="mt-4 bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-teal-400/50 dark:bg-teal-500/30 rounded-l-2xl"></div>
                  <p className="text-[15px] font-medium text-slate-700 dark:text-slate-200 pl-2">
                    {item.meaning}
                  </p>
                </div>

                <div className="mt-4 pl-1">
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-serif italic leading-relaxed break-words">
                    <span className="text-xl leading-none text-slate-300 dark:text-slate-700 mr-1 font-serif">"</span>
                    {item.example}
                    <span className="text-xl leading-none text-slate-300 dark:text-slate-700 ml-1 font-serif">"</span>
                  </p>
                </div>

                {/* Footer thẻ: trạng thái & Hành động nhanh khi di chuột */}
                <div className="mt-6 flex items-center justify-between border-t border-slate-100/50 dark:border-slate-800/50 pt-4">
                  {/* Trạng thái thuộc */}
                  <button
                    onClick={() => toggleWordLearned(item.id)}
                    className="flex items-center gap-2 hover:opacity-75 transition-opacity cursor-pointer group/btn"
                  >
                    {item.learned ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-50 dark:fill-emerald-950/20 group-hover/btn:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Đã thuộc</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover/btn:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Chưa thuộc</span>
                      </>
                    )}
                  </button>

                  {/* Hành động (Sửa, Xóa) */}
                  <div className="flex gap-2 group-hover:opacity-100 sm:opacity-0 transition-opacity">
                    <button
                      onClick={(e) => openEditModal(item, e)}
                      className="p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 text-slate-400 rounded-xl transition-all shadow-sm cursor-pointer"
                      title="Sửa từ"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-800 hover:text-rose-600 text-slate-400 rounded-xl transition-all shadow-sm cursor-pointer"
                      title="Xóa từ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-950 py-16 text-center border border-slate-250/20 dark:border-slate-850 rounded-2xl shadow-sm">
          <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto animate-pulse" />
          <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-200 mt-4">Không tìm thấy từ vựng học tập nào!</h4>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto p-2">
            Hãy đổi bộ lọc tìm kiếm hoặc nhấn nút "Thêm từ mới" ở thanh thao tác để nhanh chóng mở rộng từ điển.
          </p>
        </div>
      )}

      {/* Modal Thêm & Sửa (Sử dụng AnimatePresence mượt mà) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Content box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/50 dark:border-slate-800/80 rounded-[2.5rem] w-full max-w-lg shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-indigo-900/10 relative z-10 overflow-hidden"
            >
              {/* Decorative top gradient */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-teal-400 to-indigo-500"></div>

              {/* Header */}
              <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                <h3 className="text-xl font-serif-title text-slate-800 dark:text-slate-100">
                  {editingWord ? 'Sửa thông tin từ vựng' : 'Thêm từ vựng mới'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-slate-400 hover:bg-slate-100 hover:text-rose-500 p-2 rounded-full transition-colors cursor-pointer dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleFormSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Từ tiếng Anh <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="vd: Resilience"
                      value={wordInput}
                      onChange={(e) => setWordInput(e.target.value)}
                      onBlur={(e) => fetchAutoIpa(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-2xl px-4 py-3 text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 text-slate-800 dark:text-slate-200 shadow-sm transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Phiên âm</label>
                    <input
                      type="text"
                      placeholder="vd: /ˈmʌðər/"
                      value={ipaInput}
                      onChange={(e) => setIpaInput(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-2xl px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 text-slate-800 dark:text-slate-200 shadow-sm transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Nghĩa tiếng Việt <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="vd: Sự kiên cường, dẻo dai"
                    value={meaningInput}
                    onChange={(e) => setMeaningInput(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-2xl px-4 py-3 text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 text-slate-800 dark:text-slate-200 shadow-sm transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Ví dụ minh họa</label>
                  <textarea
                    placeholder="Viết câu ví dụ sinh động giúp mau thuộc từ vựng hơn..."
                    value={exampleInput}
                    onChange={(e) => setExampleInput(e.target.value)}
                    rows={3}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-2xl px-4 py-3 text-[15px] font-serif italic focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 text-slate-800 dark:text-slate-200 resize-none shadow-sm transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Chủ đề</label>
                    <select
                      value={topicInput}
                      onChange={(e) => setTopicInput(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-800 dark:text-slate-200 cursor-pointer shadow-sm"
                    >
                      <option value="Gia đình">Gia đình</option>
                      <option value="Công việc">Công việc</option>
                      <option value="Du lịch">Du lịch</option>
                      <option value="IELTS">IELTS</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2 opacity-0">Trạng thái</label>
                    <label className="flex items-center justify-center gap-3 h-[50px] cursor-pointer border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-2xl shadow-sm transition-colors">
                      <input
                        type="checkbox"
                        checked={learnedInput}
                        onChange={(e) => setLearnedInput(e.target.checked)}
                        className="w-5 h-5 rounded-md border-slate-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer transition-all"
                      />
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-300 select-none">Đã thuộc từ này</span>
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-6 flex gap-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 py-3.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[13px] rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:to-indigo-400 text-white font-bold text-[13px] rounded-2xl shadow-[0_10px_20px_-10px_rgba(79,70,229,0.5)] active:scale-[0.98] transition-all cursor-pointer border border-indigo-400/20"
                  >
                    Lưu từ vựng
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
