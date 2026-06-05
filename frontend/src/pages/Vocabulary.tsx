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
  HelpCircle
} from 'lucide-react';

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
      <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850/80 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Tìm theo từ tiếng Anh hoặc nghĩa..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-800 dark:text-slate-200"
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
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="Tất cả">Tất cả</option>
              <option value="Đã thuộc">Đã thuộc</option>
              <option value="Chưa thuộc">Chưa thuộc</option>
            </select>
          </div>

          {/* Button thêm mới */}
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
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
              key={item.id}
              className="bg-white dark:bg-slate-950 rounded-2xl p-6 shadow-sm hover:shadow-md border border-slate-100 dark:border-slate-900/60 flex items-start gap-5 group transition-all duration-300"
            >
              {/* Thư mục biểu trưng cho chủ đề */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 ${
                item.learned 
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-indigo-50/60 dark:bg-slate-900/85'
              }`}>
                <BookOpen className="w-6 h-6" />
              </div>

              {/* Thông tin Chi tiết từ */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-serif-title text-slate-800 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {item.word}
                  </h3>
                  <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-950/40 px-3 py-1 rounded-full text-[10px] font-extrabold shadow-sm uppercase tracking-wider">
                    {item.topic}
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 italic mt-0.5">
                  {item.ipa}
                </p>

                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-2.5 bg-slate-50 dark:bg-slate-900/60 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-900">
                  {item.meaning}
                </p>

                <p className="text-xs text-slate-400 dark:text-slate-400 italic mt-2 py-1 leading-relaxed border-l-2 border-indigo-500/20 pl-3">
                  "{item.example}"
                </p>

                {/* Footer thẻ: trạng thái & Hành động nhanh khi di chuột */}
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 dark:border-slate-900/50 pt-4">
                  {/* Trạng thái thuộc */}
                  <button
                    onClick={() => toggleWordLearned(item.id)}
                    className="flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer text-left"
                  >
                    {item.learned ? (
                      <>
                        <CheckCircle className="w-4.5 h-4.5 text-emerald-500 fill-emerald-50 dark:fill-slate-950" />
                        <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">Đã thuộc</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
                        <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400">Chưa thuộc</span>
                      </>
                    )}
                  </button>

                  {/* Hành động (Sửa, Xóa) */}
                  <div className="flex gap-1 group-hover:opacity-100 sm:opacity-0 transition-opacity">
                    <button
                      onClick={(e) => openEditModal(item, e)}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-500 dark:text-indigo-400 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 dark:text-rose-400 rounded-lg transition-colors cursor-pointer"
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
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/60">
                <h3 className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                  {editingWord ? 'Sửa thông tin từ vựng' : 'Thêm từ vựng mới'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-slate-450 hover:bg-slate-150 p-1.5 rounded-full transition-colors cursor-pointer dark:text-slate-500 dark:hover:bg-slate-850"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-500 dark:text-slate-450 block">Từ tiếng Anh <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="vd: Resilience"
                      value={wordInput}
                      onChange={(e) => setWordInput(e.target.value)}
                      onBlur={(e) => fetchAutoIpa(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-500 dark:text-slate-450 block">Phiên âm tiếng Anh</label>
                    <input
                      type="text"
                      placeholder="vd: /ˈmʌðər/"
                      value={ipaInput}
                      onChange={(e) => setIpaInput(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-500 dark:text-slate-450 block">Nghĩa tiếng Việt <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="vd: Sự kiên cường, dẻo dai"
                    value={meaningInput}
                    onChange={(e) => setMeaningInput(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-500 dark:text-slate-450 block">Ví dụ minh họa</label>
                  <textarea
                    placeholder="Viết câu ví dụ sinh động giúp mau thuộc từ vựng hơn..."
                    value={exampleInput}
                    onChange={(e) => setExampleInput(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 text-slate-800 dark:text-slate-200 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-500 dark:text-slate-450 block">Chủ đề từ vựng</label>
                    <select
                      value={topicInput}
                      onChange={(e) => setTopicInput(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-indigo-500/25 text-slate-800 dark:text-slate-250 cursor-pointer"
                    >
                      <option value="Gia đình">Gia đình</option>
                      <option value="Công việc">Công việc</option>
                      <option value="Du lịch">Du lịch</option>
                      <option value="IELTS">IELTS</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-500 dark:text-slate-450 block mb-2">Trạng thái ghi nhớ</label>
                    <label className="flex items-center gap-2 px-3 py-2 cursor-pointer border border-slate-200/40 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-xl">
                      <input
                        type="checkbox"
                        checked={learnedInput}
                        onChange={(e) => setLearnedInput(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-550 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Đã học thuộc từ này</span>
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 py-3 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 font-bold text-xs rounded-xl hover:bg-slate-50/60 dark:hover:bg-slate-850 transition-colors cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/25 active:scale-95 transition-all cursor-pointer"
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
