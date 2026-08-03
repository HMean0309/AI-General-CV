import './globals.css';

export const metadata = {
  title: 'AIGeneralCV - Hệ thống tối ưu CV thông minh',
  description:
    'Hệ thống quản lý hồ sơ năng lực và tự động tối ưu hóa CV theo Job Description dành cho sinh viên, sử dụng Trí tuệ nhân tạo.',
};

import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
