# DoganHubStore Test Configuration
import os
from datetime import datetime

# Environment Configuration
ENVIRONMENT = os.getenv('TEST_ENV', 'local')
DEBUG_MODE = os.getenv('DEBUG', 'false').lower() == 'true'

# Application URLs
BASE_URLS = {
    'local': 'http://localhost:3003',
    'staging': 'https://staging.doganhubstore.com',
    'production': 'https://doganhubstore.com'
}

API_BASE_URLS = {
    'local': 'http://localhost:3003/api',
    'staging': 'https://staging.doganhubstore.com/api',
    'production': 'https://doganhubstore.com/api'
}

BASE_URL = BASE_URLS.get(ENVIRONMENT, BASE_URLS['local'])
API_BASE_URL = API_BASE_URLS.get(ENVIRONMENT, API_BASE_URLS['local'])

# Database Configuration
DATABASE_CONFIG = {
    'local': {
        'host': 'localhost',
        'port': 5432,
        'database': 'doganhubstore',
        'user': 'postgres',
        'password': 'postgres'
    },
    'staging': {
        'host': os.getenv('DB_HOST', 'localhost'),
        'port': int(os.getenv('DB_PORT', 5432)),
        'database': os.getenv('DB_NAME', 'doganhubstore_staging'),
        'user': os.getenv('DB_USER', 'postgres'),
        'password': os.getenv('DB_PASSWORD', 'postgres')
    }
}

DB_CONFIG = DATABASE_CONFIG.get(ENVIRONMENT, DATABASE_CONFIG['local'])

# Browser Configuration
BROWSER_CONFIG = {
    'browser': os.getenv('BROWSER', 'Chrome'),
    'headless': os.getenv('HEADLESS', 'false').lower() == 'true',
    'window_size': os.getenv('WINDOW_SIZE', '1920x1080'),
    'implicit_wait': int(os.getenv('IMPLICIT_WAIT', 10)),
    'page_load_timeout': int(os.getenv('PAGE_LOAD_TIMEOUT', 30)),
    'element_timeout': int(os.getenv('ELEMENT_TIMEOUT', 15))
}

# Test User Credentials
TEST_USERS = {
    'standard_user': {
        'email': 'test@doganhubstore.com',
        'password': 'TestPassword123!',
        'name': 'Test User'
    },
    'admin_user': {
        'email': 'admin@doganhubstore.com',
        'password': 'AdminPassword123!',
        'name': 'Admin User'
    },
    'sales_user': {
        'email': 'sales@doganhubstore.com',
        'password': 'SalesPassword123!',
        'name': 'Sales User'
    },
    'finance_user': {
        'email': 'finance@doganhubstore.com',
        'password': 'FinancePassword123!',
        'name': 'Finance User'
    }
}

# API Configuration
API_CONFIG = {
    'timeout': int(os.getenv('API_TIMEOUT', 30)),
    'retries': int(os.getenv('API_RETRIES', 3)),
    'retry_delay': int(os.getenv('API_RETRY_DELAY', 1)),
    'rate_limit': int(os.getenv('API_RATE_LIMIT', 100))
}

# Test Data Configuration
TEST_DATA_CONFIG = {
    'cleanup_after_tests': os.getenv('CLEANUP_TEST_DATA', 'true').lower() == 'true',
    'backup_before_tests': os.getenv('BACKUP_TEST_DATA', 'false').lower() == 'true',
    'generate_mock_data': os.getenv('GENERATE_MOCK_DATA', 'true').lower() == 'true'
}

# Performance Thresholds
PERFORMANCE_THRESHOLDS = {
    'page_load_time': float(os.getenv('PAGE_LOAD_THRESHOLD', 5.0)),
    'api_response_time': float(os.getenv('API_RESPONSE_THRESHOLD', 2.0)),
    'search_response_time': float(os.getenv('SEARCH_RESPONSE_THRESHOLD', 1.0))
}

# Screenshot Configuration
SCREENSHOT_CONFIG = {
    'enabled': os.getenv('SCREENSHOTS', 'true').lower() == 'true',
    'on_failure': os.getenv('SCREENSHOTS_ON_FAILURE', 'true').lower() == 'true',
    'quality': int(os.getenv('SCREENSHOT_QUALITY', 85)),
    'format': os.getenv('SCREENSHOT_FORMAT', 'PNG')
}

# Logging Configuration
LOGGING_CONFIG = {
    'level': os.getenv('LOG_LEVEL', 'INFO'),
    'file': os.getenv('LOG_FILE', f'test_log_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
    'console': os.getenv('LOG_CONSOLE', 'true').lower() == 'true'
}

# Report Configuration
REPORT_CONFIG = {
    'output_dir': os.getenv('REPORT_DIR', 'reports'),
    'report_format': os.getenv('REPORT_FORMAT', 'html'),
    'include_screenshots': os.getenv('REPORT_SCREENSHOTS', 'true').lower() == 'true',
    'include_logs': os.getenv('REPORT_LOGS', 'true').lower() == 'true'
}

# Parallel Execution Configuration
PARALLEL_CONFIG = {
    'enabled': os.getenv('PARALLEL_EXECUTION', 'false').lower() == 'true',
    'processes': int(os.getenv('PARALLEL_PROCESSES', 4)),
    'test_level': os.getenv('PARALLEL_LEVEL', 'test')  # test, suite, or tag
}

# Module-specific Configuration
MODULE_CONFIG = {
    'dashboard': {
        'enabled': True,
        'critical_tests': ['Test Main Dashboard', 'Test API Dashboard']
    },
    'finance': {
        'enabled': True,
        'critical_tests': ['Test Finance Transactions', 'Test Finance Dashboard']
    },
    'sales': {
        'enabled': True,
        'critical_tests': ['Test Complete Sales Cycle', 'Test Sales Leads']
    },
    'hr': {
        'enabled': True,
        'critical_tests': ['Test HR Employees', 'Test HR Payroll']
    },
    'analytics': {
        'enabled': True,
        'critical_tests': ['Test Analytics Dashboard']
    },
    'auth': {
        'enabled': True,
        'critical_tests': ['Test Login Page', 'Test Registration Page']
    }
}

# Mobile Testing Configuration
MOBILE_CONFIG = {
    'enabled': os.getenv('MOBILE_TESTING', 'false').lower() == 'true',
    'devices': [
        {'name': 'iPhone 12', 'width': 390, 'height': 844},
        {'name': 'iPad Air', 'width': 820, 'height': 1180},
        {'name': 'Samsung Galaxy S21', 'width': 384, 'height': 854}
    ]
}

# Security Testing Configuration
SECURITY_CONFIG = {
    'enabled': os.getenv('SECURITY_TESTING', 'false').lower() == 'true',
    'xss_tests': True,
    'sql_injection_tests': True,
    'csrf_tests': True,
    'auth_bypass_tests': True
}

# Load Testing Configuration
LOAD_CONFIG = {
    'enabled': os.getenv('LOAD_TESTING', 'false').lower() == 'true',
    'concurrent_users': int(os.getenv('LOAD_USERS', 10)),
    'test_duration': int(os.getenv('LOAD_DURATION', 300)),  # seconds
    'ramp_up_time': int(os.getenv('LOAD_RAMP_UP', 60))  # seconds
}

# Accessibility Testing Configuration
ACCESSIBILITY_CONFIG = {
    'enabled': os.getenv('ACCESSIBILITY_TESTING', 'false').lower() == 'true',
    'wcag_level': os.getenv('WCAG_LEVEL', 'AA'),
    'check_color_contrast': True,
    'check_keyboard_navigation': True,
    'check_screen_reader': True
}

# Integration Testing Configuration
INTEGRATION_CONFIG = {
    'external_apis': {
        'payment_gateway': os.getenv('PAYMENT_API_URL', 'https://api.stripe.com'),
        'email_service': os.getenv('EMAIL_API_URL', 'https://api.sendgrid.com'),
        'analytics_service': os.getenv('ANALYTICS_API_URL', 'https://api.analytics.com')
    },
    'test_external_apis': os.getenv('TEST_EXTERNAL_APIS', 'false').lower() == 'true'
}

# Notification Configuration
NOTIFICATION_CONFIG = {
    'enabled': os.getenv('NOTIFICATIONS', 'false').lower() == 'true',
    'slack_webhook': os.getenv('SLACK_WEBHOOK', ''),
    'email_recipients': os.getenv('EMAIL_RECIPIENTS', '').split(','),
    'teams_webhook': os.getenv('TEAMS_WEBHOOK', '')
}

# File Upload Testing
FILE_UPLOAD_CONFIG = {
    'test_files_dir': os.path.join(os.path.dirname(__file__), '..', 'test_files'),
    'max_file_size': int(os.getenv('MAX_FILE_SIZE', 10485760)),  # 10MB
    'allowed_extensions': ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'png', 'jpg', 'jpeg']
}

# Email Testing Configuration
EMAIL_CONFIG = {
    'smtp_server': os.getenv('SMTP_SERVER', 'localhost'),
    'smtp_port': int(os.getenv('SMTP_PORT', 1025)),
    'test_email_domain': os.getenv('TEST_EMAIL_DOMAIN', 'example.com'),
    'mailhog_api': os.getenv('MAILHOG_API', 'http://localhost:8025/api')
}

# Cleanup Configuration
CLEANUP_CONFIG = {
    'cleanup_test_data': TEST_DATA_CONFIG['cleanup_after_tests'],
    'cleanup_screenshots': os.getenv('CLEANUP_SCREENSHOTS', 'false').lower() == 'true',
    'cleanup_logs': os.getenv('CLEANUP_LOGS', 'false').lower() == 'true',
    'retention_days': int(os.getenv('RETENTION_DAYS', 7))
}

# Export all configurations
__all__ = [
    'ENVIRONMENT', 'BASE_URL', 'API_BASE_URL', 'DB_CONFIG',
    'BROWSER_CONFIG', 'TEST_USERS', 'API_CONFIG', 'TEST_DATA_CONFIG',
    'PERFORMANCE_THRESHOLDS', 'SCREENSHOT_CONFIG', 'LOGGING_CONFIG',
    'REPORT_CONFIG', 'PARALLEL_CONFIG', 'MODULE_CONFIG', 'MOBILE_CONFIG',
    'SECURITY_CONFIG', 'LOAD_CONFIG', 'ACCESSIBILITY_CONFIG',
    'INTEGRATION_CONFIG', 'NOTIFICATION_CONFIG', 'FILE_UPLOAD_CONFIG',
    'EMAIL_CONFIG', 'CLEANUP_CONFIG'
]