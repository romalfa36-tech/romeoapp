import React, { useState } from 'react';
import { useApp } from '../lib/context';
import { Button, Card } from './ui';
import { Lock, Mail, AlertCircle, User } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, loginWithUsername } = useApp();
  const [loginMethod, setLoginMethod] = useState<'email' | 'username'>('email');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      let success = false;
      if (loginMethod === 'email') {
        success = await login(email, password);
      } else {
        success = await loginWithUsername(username, password);
      }

      if (!success) {
        setError('اسم المستخدم أو كلمة المرور غير صحيحة');
      }
    } catch (err) {
      setError('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E3A5F] to-[#2D7D46] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-4">
            <span className="text-3xl font-bold text-[#1E3A5F]">BF</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Beeforce</h1>
          <p className="text-white/80">نظام إدارة التموين والإنتاج</p>
        </div>

        {/* Login Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Login Method Toggle */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => setLoginMethod('email')}
                className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                  loginMethod === 'email'
                    ? 'bg-white text-[#1E3A5F] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Mail className="w-4 h-4 inline ml-2" />
                بالبريد
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('username')}
                className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                  loginMethod === 'username'
                    ? 'bg-white text-[#1E3A5F] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <User className="w-4 h-4 inline ml-2" />
                باسم المستخدم
              </button>
            </div>

            {loginMethod === 'email' ? (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent"
                    placeholder="name@company.com"
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">اسم المستخدم</label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent"
                    placeholder="username"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              تسجيل الدخول
            </Button>
          </form>

        </Card>

        {/* Footer */}
        <p className="text-center text-white/60 text-sm mt-6">
          جميع الحقوق محفوظة © 2026 Beeforce
        </p>
      </div>
    </div>
  );
};