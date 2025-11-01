# Persian to English Translation Map for k8s-installer.sh

translations = {
    # Worker nodes messages
    "تمام Worker Nodes نصب شدند": "All Worker Nodes installed successfully",
    "بررسی وضعیت کلاستر...": "Checking cluster status...",
    "بررسی کلاستر انجام شد": "Cluster check completed",
    
    # cert-manager messages
    "نصب SSL غیرفعال است. از cert-manager صرف‌نظر می‌شود.": "SSL installation is disabled. Skipping cert-manager.",
    "نصب cert-manager...": "Installing cert-manager...",
    "انتظار برای آماده شدن cert-manager...": "Waiting for cert-manager to be ready...",
    "cert-manager نصب شد": "cert-manager installed successfully",
    
    # Management panel messages
    "پنل مدیریت نیاز به SSL و دامنه دارد. از نصب پنل صرف‌نظر می‌شود.": "Management panel requires SSL and domain. Skipping panel installation.",
    "برای نصب پنل بعداً، از دستور زیر استفاده کنید:": "To install the panel later, use the following command:",
    "نصب پنل مدیریت...": "Installing management panel...",
    "ساخت Namespace برای پنل مدیریت...": "Creating namespace for management panel...",
    "نصب PostgreSQL...": "Installing PostgreSQL...",
    "نصب Redis...": "Installing Redis...",
    "انتظار برای آماده شدن PostgreSQL و Redis...": "Waiting for PostgreSQL and Redis to be ready...",
    "نصب API Backend...": "Installing API Backend...",
    "نصب Frontend Panel...": "Installing Frontend Panel...",
    "ساخت Ingress برای پنل...": "Creating Ingress for panel...",
    "پنل مدیریت نصب شد": "Management panel installed successfully",
    "پنل در آدرس زیر در دسترس است:": "Panel is available at the following address:",
    "برای ایجاد اولین کاربر admin از دستور زیر استفاده کنید:": "To create the first admin user, use the following command:",
    "اطلاعات دسترسی:": "Access Information:",
    "ذخیره شده در": "saved in",
    
    # Traefik messages
    "نصب Traefik Ingress Controller...": "Installing Traefik Ingress Controller...",
    "نصب Traefik...": "Installing Traefik...",
    "انتظار برای آماده شدن Traefik...": "Waiting for Traefik to be ready...",
    "Traefik نصب شد": "Traefik installed successfully",
    
    # Init cluster messages
    "شروع نصب کلاستر Kubernetes...": "Starting Kubernetes cluster installation...",
    "نصب کلاستر با موفقیت انجام شد!": "Cluster installation completed successfully!",
    "خلاصه نصب:": "Installation Summary:",
    "آدرس Master:": "Master Address:",
    "تعداد Workers:": "Number of Workers:",
    "SSL فعال:": "SSL Enabled:",
    "دامنه پنل:": "Panel Domain:",
    "مرحله بعد:": "Next Steps:",
    "ایجاد کاربر مدیر (Admin):": "Create Admin User:",
    "دسترسی به پنل:": "Access Panel:",
    "مدیریت کلاستر:": "Manage Cluster:",
    "بررسی وضعیت:": "Check Status:",
    "افزودن Worker جدید:": "Add New Worker:",
    "فایل‌های مهم:": "Important Files:",
    "کانفیگ کلاستر:": "Cluster Configuration:",
    "لاگ نصب:": "Installation Log:",
    
    # Add worker messages
    "افزودن Worker Node جدید...": "Adding new Worker Node...",
    "Worker Node جدید با موفقیت اضافه شد!": "New Worker Node added successfully!",
    "Worker Node اضافه شد:": "Worker Node added:",
    
    # Status messages
    "وضعیت کلاستر Kubernetes": "Kubernetes Cluster Status",
    "اطلاعات کلاستر:": "Cluster Information:",
    "Nodes در کلاستر:": "Nodes in Cluster:",
    "Pods در حال اجرا:": "Running Pods:",
    "Services فعال:": "Active Services:",
    
    # Usage/help messages
    "استفاده:": "Usage:",
    "دستورات:": "Commands:",
    "نصب کلاستر جدید": "Install new cluster",
    "افزودن Worker Node": "Add Worker Node",
    "نصب پنل مدیریت": "Install management panel",
    "نمایش وضعیت کلاستر": "Display cluster status",
    "نمایش راهنمای استفاده": "Display usage guide",
    "مثال‌ها:": "Examples:",
    
    # Error messages
    "خطا:": "Error:",
    "Worker IP مشخص نشده است": "Worker IP not specified",
    "لطفاً IP Worker Node را مشخص کنید": "Please specify the Worker Node IP",
    "دامنه یا ایمیل مشخص نشده است": "Domain or email not specified",
    "دستور نامعتبر": "Invalid command",
    "پارامترهای کافی ارائه نشده": "Insufficient parameters provided",
}

print("Translations loaded:", len(translations))
