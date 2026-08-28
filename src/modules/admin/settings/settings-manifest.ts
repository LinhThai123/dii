import { SettingValueType } from '@prisma/client';

export interface PlatformSettingDefinition {
  key: string;
  value: string;
  valueType: SettingValueType;
  category: string;
  label: string;
  description?: string;
  isPublic?: boolean;
}

export const PLATFORM_SETTINGS_MANIFEST: PlatformSettingDefinition[] = [
  // General
  { key: 'general.platform_name', value: 'Dii', valueType: 'STRING', category: 'general', label: 'Platform name', isPublic: true },
  { key: 'general.platform_description', value: 'Ứng dụng hẹn hò và kế hoạch cho cặp đôi', valueType: 'STRING', category: 'general', label: 'Platform description', isPublic: true },
  { key: 'general.support_email', value: 'support@dii.app', valueType: 'STRING', category: 'general', label: 'Support email', isPublic: true },
  { key: 'general.support_phone', value: '+84 1900 1234', valueType: 'STRING', category: 'general', label: 'Support phone', isPublic: true },
  { key: 'general.company_address', value: 'TP. Hồ Chí Minh, Việt Nam', valueType: 'STRING', category: 'general', label: 'Company address', isPublic: true },
  { key: 'general.timezone', value: 'Asia/Ho_Chi_Minh', valueType: 'STRING', category: 'general', label: 'Timezone', isPublic: true },
  { key: 'general.language', value: 'vi', valueType: 'STRING', category: 'general', label: 'Language', isPublic: true },
  { key: 'general.currency', value: 'VND', valueType: 'STRING', category: 'general', label: 'Currency', isPublic: true },

  // Branding
  { key: 'branding.logo_url', value: '', valueType: 'STRING', category: 'branding', label: 'Logo URL', isPublic: true },
  { key: 'branding.favicon_url', value: '', valueType: 'STRING', category: 'branding', label: 'Favicon URL', isPublic: true },
  { key: 'branding.login_background_url', value: '', valueType: 'STRING', category: 'branding', label: 'Login background', isPublic: true },
  { key: 'branding.landing_banner_url', value: '', valueType: 'STRING', category: 'branding', label: 'Landing banner', isPublic: true },
  { key: 'branding.primary_color', value: '#FF5A7A', valueType: 'STRING', category: 'branding', label: 'Primary color', isPublic: true },
  { key: 'branding.secondary_color', value: '#FF8EA1', valueType: 'STRING', category: 'branding', label: 'Secondary color', isPublic: true },
  { key: 'branding.footer_content', value: '© Dii — Hẹn hò thông minh', valueType: 'STRING', category: 'branding', label: 'Footer content', isPublic: true },
  { key: 'branding.social_links', value: '{"facebook":"","instagram":"","tiktok":""}', valueType: 'JSON', category: 'branding', label: 'Social links', isPublic: true },

  // Users
  { key: 'users.enable_registration', value: 'true', valueType: 'BOOLEAN', category: 'users', label: 'Enable registration', isPublic: true },
  { key: 'users.enable_google_login', value: 'true', valueType: 'BOOLEAN', category: 'users', label: 'Google login', isPublic: true },
  { key: 'users.enable_facebook_login', value: 'true', valueType: 'BOOLEAN', category: 'users', label: 'Facebook login', isPublic: true },
  { key: 'users.enable_apple_login', value: 'false', valueType: 'BOOLEAN', category: 'users', label: 'Apple login', isPublic: true },
  { key: 'users.email_verification', value: 'true', valueType: 'BOOLEAN', category: 'users', label: 'Email verification', isPublic: false },
  { key: 'users.phone_verification', value: 'true', valueType: 'BOOLEAN', category: 'users', label: 'Phone verification', isPublic: false },
  { key: 'users.default_role', value: 'user', valueType: 'STRING', category: 'users', label: 'Default user role', isPublic: false },

  // Couples
  { key: 'couples.enable_features', value: 'true', valueType: 'BOOLEAN', category: 'couples', label: 'Enable couple features', isPublic: true },
  { key: 'couples.enable_memories', value: 'true', valueType: 'BOOLEAN', category: 'couples', label: 'Enable memories', isPublic: true },
  { key: 'couples.enable_anniversary_tracking', value: 'true', valueType: 'BOOLEAN', category: 'couples', label: 'Anniversary tracking', isPublic: true },
  { key: 'couples.enable_relationship_timeline', value: 'true', valueType: 'BOOLEAN', category: 'couples', label: 'Relationship timeline', isPublic: true },
  { key: 'couples.max_memory_upload', value: '50', valueType: 'NUMBER', category: 'couples', label: 'Max memory upload (MB)', isPublic: false },
  { key: 'couples.max_shared_plans', value: '100', valueType: 'NUMBER', category: 'couples', label: 'Max shared plans', isPublic: false },

  // Places
  { key: 'places.enable_reviews', value: 'true', valueType: 'BOOLEAN', category: 'places', label: 'Enable place reviews', isPublic: true },
  { key: 'places.enable_google_sync', value: 'true', valueType: 'BOOLEAN', category: 'places', label: 'Mapbox Places sync', isPublic: false },
  { key: 'places.require_moderation', value: 'false', valueType: 'BOOLEAN', category: 'places', label: 'Require moderation', isPublic: false },

  // Booking
  { key: 'booking.enable_restaurant', value: 'true', valueType: 'BOOLEAN', category: 'booking', label: 'Restaurant booking', isPublic: true },
  { key: 'booking.enable_travel', value: 'true', valueType: 'BOOLEAN', category: 'booking', label: 'Travel booking', isPublic: true },
  { key: 'booking.enable_affiliate', value: 'false', valueType: 'BOOLEAN', category: 'booking', label: 'Affiliate booking', isPublic: true },
  { key: 'booking.cancellation_policy', value: 'Hủy miễn phí trước 24 giờ', valueType: 'STRING', category: 'booking', label: 'Cancellation policy', isPublic: true },
  { key: 'booking.expiration_hours', value: '24', valueType: 'NUMBER', category: 'booking', label: 'Booking expiration (hours)', isPublic: false },

  // Payments
  { key: 'payments.enable_vnpay', value: 'true', valueType: 'BOOLEAN', category: 'payments', label: 'VNPay', isPublic: true },
  { key: 'payments.enable_momo', value: 'true', valueType: 'BOOLEAN', category: 'payments', label: 'MoMo', isPublic: true },
  { key: 'payments.enable_zalopay', value: 'false', valueType: 'BOOLEAN', category: 'payments', label: 'ZaloPay', isPublic: true },
  { key: 'payments.enable_stripe', value: 'false', valueType: 'BOOLEAN', category: 'payments', label: 'Stripe', isPublic: false },
  { key: 'payments.enable_paypal', value: 'false', valueType: 'BOOLEAN', category: 'payments', label: 'PayPal', isPublic: false },
  { key: 'payments.commission_rate', value: '10', valueType: 'NUMBER', category: 'payments', label: 'Commission rate (%)', isPublic: false },
  { key: 'payments.refund_policy', value: 'Hoàn tiền trong 7 ngày', valueType: 'STRING', category: 'payments', label: 'Refund policy', isPublic: true },

  // Notifications
  { key: 'notifications.push_enabled', value: 'true', valueType: 'BOOLEAN', category: 'notifications', label: 'Push notifications', isPublic: false },
  { key: 'notifications.email_enabled', value: 'true', valueType: 'BOOLEAN', category: 'notifications', label: 'Email notifications', isPublic: false },
  { key: 'notifications.sms_enabled', value: 'false', valueType: 'BOOLEAN', category: 'notifications', label: 'SMS notifications', isPublic: false },
  { key: 'notifications.anniversary_reminder', value: 'true', valueType: 'BOOLEAN', category: 'notifications', label: 'Anniversary reminder', isPublic: false },
  { key: 'notifications.promotion_notification', value: 'true', valueType: 'BOOLEAN', category: 'notifications', label: 'Promotion notification', isPublic: false },
  { key: 'notifications.booking_reminder', value: 'true', valueType: 'BOOLEAN', category: 'notifications', label: 'Booking reminder', isPublic: false },

  // AI
  { key: 'ai.openai_api_key', value: '', valueType: 'STRING', category: 'ai', label: 'OpenAI API key', isPublic: false },
  { key: 'ai.gemini_api_key', value: '', valueType: 'STRING', category: 'ai', label: 'Gemini API key', isPublic: false },
  { key: 'ai.model', value: 'gpt-4o', valueType: 'STRING', category: 'ai', label: 'AI model', isPublic: false },
  { key: 'ai.daily_usage_limit', value: '1000', valueType: 'NUMBER', category: 'ai', label: 'Daily usage limit', isPublic: false },
  { key: 'ai.monthly_usage_limit', value: '30000', valueType: 'NUMBER', category: 'ai', label: 'Monthly usage limit', isPublic: false },
  { key: 'ai.max_requests_per_user', value: '50', valueType: 'NUMBER', category: 'ai', label: 'Max requests per user', isPublic: false },
  { key: 'ai.temperature', value: '0.7', valueType: 'NUMBER', category: 'ai', label: 'AI temperature', isPublic: false },

  // Security
  { key: 'security.password_min_length', value: '8', valueType: 'NUMBER', category: 'security', label: 'Password min length', isPublic: false },
  { key: 'security.require_special_char', value: 'true', valueType: 'BOOLEAN', category: 'security', label: 'Require special character', isPublic: false },
  { key: 'security.require_number', value: 'true', valueType: 'BOOLEAN', category: 'security', label: 'Require number', isPublic: false },
  { key: 'security.session_timeout_minutes', value: '60', valueType: 'NUMBER', category: 'security', label: 'Session timeout (minutes)', isPublic: false },
  { key: 'security.two_factor_auth', value: 'false', valueType: 'BOOLEAN', category: 'security', label: 'Two factor authentication', isPublic: false },
  { key: 'security.admin_login_protection', value: 'true', valueType: 'BOOLEAN', category: 'security', label: 'Admin login protection', isPublic: false },

  // Integrations
  { key: 'integrations.google_maps_api_key', value: '', valueType: 'STRING', category: 'integrations', label: 'Google Maps API key', isPublic: false },
  { key: 'integrations.mapbox_access_token', value: '', valueType: 'STRING', category: 'integrations', label: 'Mapbox access token (pk.*)', isPublic: false, description: 'Public token for map display — set MAPBOX_ACCESS_TOKEN in server env for runtime' },
  { key: 'integrations.mapbox_style_url', value: 'mapbox://styles/mapbox/streets-v12', valueType: 'STRING', category: 'integrations', label: 'Mapbox style URL', isPublic: true },
  { key: 'integrations.firebase_config', value: '', valueType: 'STRING', category: 'integrations', label: 'Firebase config', isPublic: false },
  { key: 'integrations.google_analytics_id', value: '', valueType: 'STRING', category: 'integrations', label: 'Google Analytics ID', isPublic: false },
  { key: 'integrations.meta_pixel_id', value: '', valueType: 'STRING', category: 'integrations', label: 'Meta Pixel ID', isPublic: false },
  { key: 'integrations.tiktok_pixel_id', value: '', valueType: 'STRING', category: 'integrations', label: 'TikTok Pixel ID', isPublic: false },
  { key: 'integrations.cloudinary_cloud_name', value: '', valueType: 'STRING', category: 'integrations', label: 'Cloudinary cloud name', isPublic: false },

  // System
  { key: 'system.maintenance_mode', value: 'false', valueType: 'BOOLEAN', category: 'system', label: 'Maintenance mode', isPublic: true },
  { key: 'system.enable_logging', value: 'true', valueType: 'BOOLEAN', category: 'system', label: 'Enable logging', isPublic: false },
  { key: 'system.backup_schedule', value: '0 2 * * *', valueType: 'STRING', category: 'system', label: 'Backup schedule (cron)', isPublic: false },
  { key: 'system.storage_usage_gb', value: '12.5', valueType: 'NUMBER', category: 'system', label: 'Storage usage (GB)', isPublic: false },
  { key: 'system.database_status', value: 'healthy', valueType: 'STRING', category: 'system', label: 'Database status', isPublic: false },
  { key: 'system.health_score', value: '98', valueType: 'NUMBER', category: 'system', label: 'System health score', isPublic: false },
];

export const PLATFORM_SETTINGS_BY_KEY = Object.fromEntries(
  PLATFORM_SETTINGS_MANIFEST.map((item) => [item.key, item]),
);
