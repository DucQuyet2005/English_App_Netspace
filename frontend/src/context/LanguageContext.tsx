import React, { createContext, useContext, useState } from 'react';
import { translations, Language } from '../utils/translations';

interface LanguageContextType {
    language: Language;
    toggleLanguage: () => void;
    t: (keyPath: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Đọc ngôn ngữ mặc định từ LocalStorage, nếu chưa có thì dùng Tiếng Việt ('vi')
    const [language, setLanguage] = useState<Language>(() => {
        return (localStorage.getItem('lingoflow_lang') as Language) || 'vi';
    });

    // Hàm đảo ngược ngôn ngữ
    const toggleLanguage = () => {
        const nextLang: Language = language === 'vi' ? 'en' : 'vi';
        setLanguage(nextLang);
        localStorage.setItem('lingoflow_lang', nextLang); // Lưu vào máy người dùng
    };

    // Hàm `t` (viết tắt của translate) lấy chữ từ thư viện translations.ts
    const t = (keyPath: string): string => {
        const keys = keyPath.split('.'); // Tách 'sidebar.dashboard' thành ['sidebar', 'dashboard']
        let result: any = translations[language];

        for (const key of keys) {
            if (result && result[key] !== undefined) {
                result = result[key];
            } else {
                return keyPath; // Nếu không tìm thấy bản dịch, trả về tên khóa gốc
            }
        }
        return typeof result === 'string' ? result : keyPath;
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

// Hook để các component khác lấy hàm t() và language ra dùng
export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
    return context;
};
