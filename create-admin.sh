#!/bin/bash

###############################################
# Create First Admin User
# این اسکریپت اولین کاربر Admin رو می‌سازه
###############################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
cat << "EOF"
╔════════════════════════════════════════╗
║   ساخت کاربر Admin                    ║
╚════════════════════════════════════════╝
EOF
echo -e "${NC}"

# بررسی kubectl
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}خطا: kubectl یافت نشد${NC}"
    exit 1
fi

# بررسی namespace
if ! kubectl get namespace k8s-management &> /dev/null; then
    echo -e "${RED}خطا: پنل مدیریت نصب نشده است${NC}"
    exit 1
fi

# دریافت اطلاعات از کاربر
echo ""
read -p "ایمیل Admin: " ADMIN_EMAIL
read -sp "پسورد: " ADMIN_PASSWORD
echo ""
read -p "نام کامل: " ADMIN_NAME

# Hash کردن پسورد
echo -e "${YELLOW}در حال hash کردن پسورد...${NC}"

# ساخت temporary pod برای hash کردن پسورد
HASHED_PASSWORD=$(kubectl run -i --rm --restart=Never password-hasher \
    --image=golang:1.21-alpine \
    --command -- sh -c "
        apk add --no-cache git > /dev/null 2>&1
        go install golang.org/x/crypto/bcrypt@latest > /dev/null 2>&1
        cat <<CODE | go run -
package main
import (
    \"fmt\"
    \"golang.org/x/crypto/bcrypt\"
)
func main() {
    hash, _ := bcrypt.GenerateFromPassword([]byte(\"$ADMIN_PASSWORD\"), bcrypt.DefaultCost)
    fmt.Print(string(hash))
}
CODE
    " 2>/dev/null)

echo -e "${GREEN}✓ پسورد hash شد${NC}"

# اتصال به database و ساخت کاربر
echo -e "${YELLOW}در حال ساخت کاربر در دیتابیس...${NC}"

kubectl exec -i -n k8s-management deployment/postgres -- \
    psql -U postgres -d k8s_management <<EOF
INSERT INTO users (email, password, name, role, is_active, created_at, updated_at)
VALUES (
    '$ADMIN_EMAIL',
    '$HASHED_PASSWORD',
    '$ADMIN_NAME',
    'admin',
    true,
    NOW(),
    NOW()
);
EOF

echo -e "${GREEN}✓ کاربر Admin با موفقیت ساخته شد!${NC}"
echo ""
echo -e "${BLUE}اطلاعات ورود:${NC}"
echo -e "  ایمیل: ${GREEN}$ADMIN_EMAIL${NC}"
echo -e "  پسورد: ${GREEN}(همان پسوردی که وارد کردید)${NC}"
echo -e "  نقش: ${GREEN}admin${NC}"
echo ""

# دریافت URL پنل
PANEL_DOMAIN=$(kubectl get ingress -n k8s-management management-panel-ingress -o jsonpath='{.spec.rules[0].host}' 2>/dev/null)

if [ -n "$PANEL_DOMAIN" ]; then
    echo -e "${BLUE}لینک ورود به پنل:${NC}"
    echo -e "  ${GREEN}https://$PANEL_DOMAIN${NC}"
else
    echo -e "${YELLOW}توجه: پنل مدیریت هنوز آماده نیست. لطفاً چند دقیقه صبر کنید.${NC}"
fi

echo ""
echo -e "${GREEN}✓ همه چیز آماده است!${NC}"
