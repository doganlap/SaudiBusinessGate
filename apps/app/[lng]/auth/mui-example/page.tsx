'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
  Divider,
  Stack
} from '@mui/material';
// استخدام Lucide بدلاً من MUI icons لتجنب dependency إضافية
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';

export default function MUIAuthExample() {
  const params = useParams();
  const router = useRouter();
  const lng = params.lng as string;
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من صحة البيانات
    const newErrors = {
      email: !formData.email ? 'البريد الإلكتروني مطلوب' : '',
      password: !formData.password ? 'كلمة المرور مطلوبة' : ''
    };
    
    setErrors(newErrors);
    
    if (newErrors.email || newErrors.password) {
      return;
    }
    
    setLoading(true);
    
    // محاكاة تسجيل الدخول
    setTimeout(() => {
      setLoading(false);
      router.push(`/${lng}/dashboard`);
    }, 2000);
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // مسح الخطأ عند الكتابة
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 400,
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* شعار التطبيق */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                backgroundColor: 'primary.main',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                mb: 2
              }}
            >
              <Typography variant="h4" color="white" fontWeight="bold">
                د
              </Typography>
            </Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              DoganHub Store
            </Typography>
            <Typography variant="body2" color="text.secondary">
              منصة إدارة الأعمال المتكاملة
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              تسجيل الدخول
            </Typography>
          </Divider>

          {/* نموذج تسجيل الدخول */}
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {/* حقل البريد الإلكتروني */}
              <TextField
                fullWidth
                label="البريد الإلكتروني"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail className={`h-5 w-5 ${errors.email ? 'text-red-500' : 'text-gray-400'}`} />
                    </InputAdornment>
                  ),
                }}
                placeholder="you@example.com"
                dir="ltr"
              />

              {/* حقل كلمة المرور */}
              <TextField
                fullWidth
                label="كلمة المرور"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange('password')}
                error={!!errors.password}
                helperText={errors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock className={`h-5 w-5 ${errors.password ? 'text-red-500' : 'text-gray-400'}`} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                placeholder="••••••••"
              />

              {/* خيارات إضافية */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="تذكرني"
                />
                <Button variant="text" size="small" color="primary">
                  نسيت كلمة المرور؟
                </Button>
              </Box>

              {/* زر تسجيل الدخول */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LogIn className="h-5 w-5" />}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </Button>
            </Stack>
          </Box>

          {/* معلومات تجريبية */}
          <Alert 
            severity="info" 
            sx={{ mt: 3, borderRadius: 2 }}
            icon={false}
          >
            <Typography variant="body2" fontWeight="medium" gutterBottom>
              🚀 حساب تجريبي للاختبار
            </Typography>
            <Box sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }} dir="ltr">
              <div>Email: demo@doganhubstore.com</div>
              <div>Password: demo123</div>
            </Box>
          </Alert>

          {/* روابط إضافية */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              ليس لديك حساب؟{' '}
              <Button variant="text" size="small" color="primary">
                إنشاء حساب جديد
              </Button>
            </Typography>
          </Box>

          {/* العودة للصفحة العادية */}
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => router.push(`/${lng}/auth`)}
            >
              العودة للصفحة العادية
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
