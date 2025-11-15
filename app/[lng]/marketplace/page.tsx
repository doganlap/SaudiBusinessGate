'use client';

import { useState, use } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Store, Bot, Zap, Globe, Shield, TrendingUp, Star } from 'lucide-react';
import { trackServiceView, trackServiceSubscribe } from '@/lib/monitoring/analytics';

interface Service {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  currency: string;
  features: string[];
  featuresAr: string[];
  popular: boolean;
  autonomous: boolean;
  category: string;
}

const services: Service[] = [
  {
    id: 'grc-pro',
    name: 'GRC Professional',
    nameAr: 'إدارة المخاطر والامتثال المحترف',
    description: 'Complete governance, risk, and compliance management',
    descriptionAr: 'إدارة شاملة للحوكمة والمخاطر والامتثال',
    price: 500,
    currency: 'SAR',
    features: ['AI Risk Assessment', 'Auto Compliance', '24/7 Monitoring', 'Real-time Reports'],
    featuresAr: ['تقييم المخاطر بالذكاء الاصطناعي', 'الامتثال التلقائي', 'مراقبة على مدار الساعة', 'تقارير فورية'],
    popular: true,
    autonomous: true,
    category: 'GRC'
  },
  {
    id: 'crm-ai',
    name: 'AI-Powered CRM',
    nameAr: 'إدارة العملاء بالذكاء الاصطناعي',
    description: 'Autonomous customer relationship management',
    descriptionAr: 'إدارة علاقات العملاء الذكية',
    price: 350,
    currency: 'SAR',
    features: ['AI Sales Agent', 'Auto Follow-ups', 'Smart Analytics', 'WhatsApp Integration'],
    featuresAr: ['وكيل مبيعات ذكي', 'متابعة تلقائية', 'تحليلات ذكية', 'تكامل واتساب'],
    popular: true,
    autonomous: true,
    category: 'CRM'
  },
  {
    id: 'hr-auto',
    name: 'Autonomous HR',
    nameAr: 'الموارد البشرية الذكية',
    description: 'Self-operating human resources management',
    descriptionAr: 'إدارة الموارد البشرية ذاتية التشغيل',
    price: 400,
    currency: 'SAR',
    features: ['AI Recruitment', 'Auto Payroll', 'Performance Tracking', 'Leave Management'],
    featuresAr: ['توظيف ذكي', 'رواتب تلقائية', 'تتبع الأداء', 'إدارة الإجازات'],
    popular: false,
    autonomous: true,
    category: 'HR'
  },
  {
    id: 'finance-ai',
    name: 'AI Finance Suite',
    nameAr: 'المالية الذكية',
    description: 'Intelligent financial management system',
    descriptionAr: 'نظام الإدارة المالية الذكي',
    price: 600,
    currency: 'SAR',
    features: ['AI Forecasting', 'Auto Invoicing', 'Expense Tracking', 'Tax Compliance'],
    featuresAr: ['تنبؤ ذكي', 'فواتير تلقائية', 'تتبع المصروفات', 'امتثال ضريبي'],
    popular: false,
    autonomous: true,
    category: 'Finance'
  },
];

interface PageProps {
  params: Promise<{ lng: string }>;
}

export default function MarketplacePage({ params }: PageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const resolvedParams = use(params);
  const isArabic = resolvedParams.lng === 'ar';

  const handleServiceView = (service: Service) => {
    trackServiceView(service.id, isArabic ? service.nameAr : service.name);
  };

  const handleSubscribe = (service: Service) => {
    trackServiceSubscribe(service.id, isArabic ? service.nameAr : service.name, service.price);
    // Navigate to subscription page or open modal
  };

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(s => s.category === selectedCategory);

  return (
    <div className="container mx-auto py-8 px-4" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Store className="h-12 w-12 text-primary" />
          <Bot className="h-10 w-10 text-primary animate-pulse" />
        </div>
        <h1 className="text-4xl font-bold mb-4">
          {isArabic ? 'المتجر السعودي' : 'Saudi Store'}
        </h1>
        <p className="text-xl text-muted-foreground mb-2">
          {isArabic 
            ? 'أول متجر ذاتي الإدارة في العالم 🇸🇦' 
            : 'The 1st Autonomous Store in the World 🇸🇦'}
        </p>
        <p className="text-sm text-muted-foreground">
          {isArabic 
            ? 'من المملكة العربية السعودية إلى العالم' 
            : 'From Saudi Arabia to The World'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Bot className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">90%</div>
              <div className="text-sm text-muted-foreground">
                {isArabic ? 'عمليات ذاتية' : 'Autonomous'}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-sm text-muted-foreground">
                {isArabic ? 'متاح دائماً' : 'Always On'}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">99.9%</div>
              <div className="text-sm text-muted-foreground">
                {isArabic ? 'وقت التشغيل' : 'Uptime'}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Globe className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">120+</div>
              <div className="text-sm text-muted-foreground">
                {isArabic ? 'دولة' : 'Countries'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {['all', 'GRC', 'CRM', 'HR', 'Finance'].map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? 'primary' : 'outline'}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat === 'all' ? (isArabic ? 'الكل' : 'All') : cat}
          </Button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <Card 
            key={service.id} 
            className="relative hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleServiceView(service)}
          >
            {service.popular && (
              <Badge className="absolute -top-2 -right-2 z-10" variant="default">
                <Star className="h-3 w-3 mr-1" />
                {isArabic ? 'الأكثر طلباً' : 'Popular'}
              </Badge>
            )}
            {service.autonomous && (
              <Badge className="absolute -top-2 left-2 z-10" variant="secondary">
                <Bot className="h-3 w-3 mr-1" />
                {isArabic ? 'ذاتي' : 'AI'}
              </Badge>
            )}
            <CardHeader>
              <CardTitle className="text-xl">
                {isArabic ? service.nameAr : service.name}
              </CardTitle>
              <CardDescription>
                {isArabic ? service.descriptionAr : service.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className="text-3xl font-bold">{service.price}</span>
                <span className="text-muted-foreground ml-2">{service.currency}/{isArabic ? 'شهر' : 'month'}</span>
              </div>
              <ul className="space-y-2">
                {(isArabic ? service.featuresAr : service.features).map((feature, idx) => (
                  <li key={idx} className="flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                size="lg"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSubscribe(service);
                }}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {isArabic ? 'اشترك الآن' : 'Subscribe Now'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* CTA Section */}
      <div className="mt-16 text-center">
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">
              {isArabic ? 'هل تحتاج خدمة مخصصة؟' : 'Need a Custom Solution?'}
            </CardTitle>
            <CardDescription>
              {isArabic 
                ? 'تواصل معنا لبناء حل ذكي مخصص لأعمالك' 
                : 'Contact us to build an AI-powered solution tailored for your business'}
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button size="lg" variant="primary">
              {isArabic ? 'تواصل معنا' : 'Contact Sales'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
