/**
 * Unified Icon System for Saudi Store
 * Ensures consistent icon sizing and styling across all components
 */

import React from 'react';
import { 
  // Navigation Icons
  Home,
  LayoutDashboard,
  Building2,
  Users,
  UserCheck,
  UserCircle,
  Settings,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  
  // Finance Icons
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  CreditCard,
  Wallet,
  Receipt,
  Calculator,

  // Business Icons
  Building,
  Briefcase,
  Package,
  ShoppingCart,
  Store,
  Tag,
  Award,
  Target,
  
  // Communication Icons
  Mail,
  Phone,
  MessageSquare,
  Send,
  Share2,
  Link2,
  
  // Action Icons
  Plus,
  Minus,
  Edit,
  Trash2,
  Save,
  Download,
  Upload,
  RefreshCw,
  RotateCcw,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  
  // Status Icons
  Check,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  HelpCircle,
  AlertTriangle,
  
  // Loading Icons
  Loader2,
  Loader,
  
  // File Icons
  File,
  FilePlus,
  FileMinus,
  FileText,
  Folder,
  FolderOpen,
  
  // Arrow Icons
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  ArrowDownRight,
  
  // Saudi/Government Icons
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Key,
  Eye,
  EyeOff,
  
  // Technology Icons
  Zap,
  ZapOff,
  Wifi,
  WifiOff,
  Database,
  Server,
  Cloud,
  CloudUpload,
  CloudDownload,
  
  // Time Icons
  Clock,
  Calendar,
  History,
  Timer,
  StopCircle,
  Play,
  Pause,
  
  // Social Icons
  Heart,
  Star,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  BookmarkPlus,
  
  // Chart Icons
  Activity,
  BarChart,
  BarChart2,
  LineChart,
  AreaChart,
  
  // Grid Icons
  Grid,
  Grid3x3,
  List,
  AlignLeft,
  AlignCenter,
  AlignRight,

  // More specific icons
  Bot,
  Sparkles,
  WandSparkles,
  Wand2,
  
  // Saudi specific
  Flag,
  Globe,
  MapPin,
  Navigation,
  
} from 'lucide-react';

// Icon size configurations
export const ICON_SIZES = {
  xs: { className: 'h-3 w-3', strokeWidth: 2 },
  sm: { className: 'h-4 w-4', strokeWidth: 2 },
  md: { className: 'h-5 w-5', strokeWidth: 2 },
  lg: { className: 'h-6 w-6', strokeWidth: 2 },
  xl: { className: 'h-8 w-8', strokeWidth: 2 },
  '2xl': { className: 'h-10 w-10', strokeWidth: 2 },
  '3xl': { className: 'h-12 w-12', strokeWidth: 2 },
} as const;

export type IconSize = keyof typeof ICON_SIZES;

// Icon color configurations
export const ICON_COLORS = {
  default: 'text-current',
  primary: 'text-blue-600',
  secondary: 'text-gray-600',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  error: 'text-red-600',
  info: 'text-blue-500',
  muted: 'text-gray-400',
  white: 'text-white',
  black: 'text-black',
} as const;

export type IconColor = keyof typeof ICON_COLORS;

// Unified Icon Props
interface IconProps {
  size?: IconSize;
  color?: IconColor;
  className?: string;
  strokeWidth?: number;
}

// Helper function to create consistent icons
function createIcon(
  IconComponent: React.ComponentType<any>,
  { size = 'md', color = 'default', className = '', strokeWidth }: IconProps = {}
) {
  const sizeConfig = ICON_SIZES[size];
  const colorClass = ICON_COLORS[color];
  const finalStrokeWidth = strokeWidth || sizeConfig.strokeWidth;
  
  return React.createElement(IconComponent, {
    className: `${sizeConfig.className} ${colorClass} ${className}`,
    strokeWidth: finalStrokeWidth,
  });
}

// Navigation Icons
export const IconHome = (props?: IconProps) => createIcon(Home, props);
export const IconDashboard = (props?: IconProps) => createIcon(LayoutDashboard, props);
export const IconBuilding = (props?: IconProps) => createIcon(Building2, props);
export const IconUsers = (props?: IconProps) => createIcon(Users, props);
export const IconUserCheck = (props?: IconProps) => createIcon(UserCheck, props);
export const IconUserCircle = (props?: IconProps) => createIcon(UserCircle, props);
export const IconSettings = (props?: IconProps) => createIcon(Settings, props);
export const IconMenu = (props?: IconProps) => createIcon(Menu, props);
export const IconClose = (props?: IconProps) => createIcon(X, props);
export const IconChevronRight = (props?: IconProps) => createIcon(ChevronRight, props);
export const IconChevronDown = (props?: IconProps) => createIcon(ChevronDown, props);
export const IconChevronLeft = (props?: IconProps) => createIcon(ChevronLeft, props);
export const IconChevronUp = (props?: IconProps) => createIcon(ChevronUp, props);

// Finance Icons
export const IconDollar = (props?: IconProps) => createIcon(DollarSign, props);
export const IconTrendingUp = (props?: IconProps) => createIcon(TrendingUp, props);
export const IconTrendingDown = (props?: IconProps) => createIcon(TrendingDown, props);
export const IconBarChart = (props?: IconProps) => createIcon(BarChart3, props);
export const IconPieChart = (props?: IconProps) => createIcon(PieChart, props);
export const IconCreditCard = (props?: IconProps) => createIcon(CreditCard, props);
export const IconWallet = (props?: IconProps) => createIcon(Wallet, props);
export const IconReceipt = (props?: IconProps) => createIcon(Receipt, props);
export const IconFileText = (props?: IconProps) => createIcon(FileText, props);
export const IconCalculator = (props?: IconProps) => createIcon(Calculator, props);

// Business Icons
export const IconBriefcase = (props?: IconProps) => createIcon(Briefcase, props);
export const IconPackage = (props?: IconProps) => createIcon(Package, props);
export const IconShoppingCart = (props?: IconProps) => createIcon(ShoppingCart, props);
export const IconStore = (props?: IconProps) => createIcon(Store, props);
export const IconTag = (props?: IconProps) => createIcon(Tag, props);
export const IconAward = (props?: IconProps) => createIcon(Award, props);
export const IconTarget = (props?: IconProps) => createIcon(Target, props);

// Action Icons
export const IconPlus = (props?: IconProps) => createIcon(Plus, props);
export const IconEdit = (props?: IconProps) => createIcon(Edit, props);
export const IconTrash = (props?: IconProps) => createIcon(Trash2, props);
export const IconSave = (props?: IconProps) => createIcon(Save, props);
export const IconDownload = (props?: IconProps) => createIcon(Download, props);
export const IconUpload = (props?: IconProps) => createIcon(Upload, props);
export const IconRefresh = (props?: IconProps) => createIcon(RefreshCw, props);
export const IconSearch = (props?: IconProps) => createIcon(Search, props);
export const IconFilter = (props?: IconProps) => createIcon(Filter, props);

// Status Icons
export const IconCheck = (props?: IconProps) => createIcon(Check, props);
export const IconCheckCircle = (props?: IconProps) => createIcon(CheckCircle, props);
export const IconXCircle = (props?: IconProps) => createIcon(XCircle, props);
export const IconAlert = (props?: IconProps) => createIcon(AlertCircle, props);
export const IconInfo = (props?: IconProps) => createIcon(Info, props);
export const IconHelp = (props?: IconProps) => createIcon(HelpCircle, props);
export const IconWarning = (props?: IconProps) => createIcon(AlertTriangle, props);

// Loading Icons
export const IconLoader = (props?: IconProps) => createIcon(Loader2, props);

// Saudi/Security Icons
export const IconShield = (props?: IconProps) => createIcon(Shield, props);
export const IconShieldCheck = (props?: IconProps) => createIcon(ShieldCheck, props);
export const IconLock = (props?: IconProps) => createIcon(Lock, props);
export const IconUnlock = (props?: IconProps) => createIcon(Unlock, props);
export const IconKey = (props?: IconProps) => createIcon(Key, props);
export const IconEye = (props?: IconProps) => createIcon(Eye, props);
export const IconEyeOff = (props?: IconProps) => createIcon(EyeOff, props);

// Technology Icons
export const IconZap = (props?: IconProps) => createIcon(Zap, props);
export const IconBot = (props?: IconProps) => createIcon(Bot, props);
export const IconSparkles = (props?: IconProps) => createIcon(Sparkles, props);
export const IconDatabase = (props?: IconProps) => createIcon(Database, props);
export const IconServer = (props?: IconProps) => createIcon(Server, props);
export const IconCloud = (props?: IconProps) => createIcon(Cloud, props);

// Time Icons
export const IconClock = (props?: IconProps) => createIcon(Clock, props);
export const IconCalendar = (props?: IconProps) => createIcon(Calendar, props);
export const IconHistory = (props?: IconProps) => createIcon(History, props);

// Communication Icons
export const IconMail = (props?: IconProps) => createIcon(Mail, props);
export const IconPhone = (props?: IconProps) => createIcon(Phone, props);
export const IconMessage = (props?: IconProps) => createIcon(MessageSquare, props);
export const IconSend = (props?: IconProps) => createIcon(Send, props);

// Arrow Icons
export const IconArrowRight = (props?: IconProps) => createIcon(ArrowRight, props);
export const IconArrowLeft = (props?: IconProps) => createIcon(ArrowLeft, props);
export const IconArrowUp = (props?: IconProps) => createIcon(ArrowUp, props);
export const IconArrowDown = (props?: IconProps) => createIcon(ArrowDown, props);

// File Icons
export const IconFile = (props?: IconProps) => createIcon(File, props);
export const IconFilePlus = (props?: IconProps) => createIcon(FilePlus, props);
export const IconFolder = (props?: IconProps) => createIcon(Folder, props);
export const IconFolderOpen = (props?: IconProps) => createIcon(FolderOpen, props);

// Chart Icons
export const IconActivity = (props?: IconProps) => createIcon(Activity, props);
export const IconLineChart = (props?: IconProps) => createIcon(LineChart, props);
export const IconAreaChart = (props?: IconProps) => createIcon(AreaChart, props);

// Saudi Specific
export const IconFlag = (props?: IconProps) => createIcon(Flag, props);
export const IconGlobe = (props?: IconProps) => createIcon(Globe, props);
export const IconMapPin = (props?: IconProps) => createIcon(MapPin, props);
export const IconNavigation = (props?: IconProps) => createIcon(Navigation, props);

// Special Saudi Flag Icon Component
export const IconSaudiFlag = (props?: IconProps) => {
  const sizeConfig = ICON_SIZES[props?.size || 'md'];
  const colorClass = ICON_COLORS[props?.color || 'default'];
  
  return (
    <span 
      className={`${sizeConfig.className} ${colorClass} ${props?.className || ''} emoji`}
      role="img" 
      aria-label="Saudi Arabia"
      title="Saudi Arabia"
    >
      🇸🇦
    </span>
  );
};

// Loading Spinner Component
export const LoadingSpinner = ({ size = 'md', color = 'primary' }: { size?: IconSize; color?: IconColor }) => (
  <div className={`animate-spin ${ICON_SIZES[size].className} ${ICON_COLORS[color]}`}>
    <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  </div>
);

// Icon Button Component
interface IconButtonProps extends IconProps {
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  variant?: 'default' | 'outline' | 'ghost';
  children?: React.ReactNode;
}

export const IconButton: React.FC<IconButtonProps> = ({ 
  onClick, 
  disabled = false, 
  title, 
  variant = 'default',
  children,
  className = '',
  ...iconProps 
}) => {
  const variantClasses = {
    default: 'bg-transparent hover:bg-gray-100 text-gray-700',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-600',
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex items-center justify-center rounded-md p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// Export default icon sizes and colors for reference
export { ICON_SIZES as IconSizes, ICON_COLORS as IconColors };