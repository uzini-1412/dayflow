#!/usr/bin/env bash
# 백엔드 VM(Ubuntu) 최초 1회 설정: Caddy(HTTPS 자동) + PocketBase systemd 템플릿 + 스왑
# 이후 프로젝트별 백엔드는 add-pb-app.sh 로 추가한다.
# 사용: sudo bash server-setup.sh
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

apt-get update
apt-get install -y curl unzip gpg debian-keyring debian-archive-keyring apt-transport-https

# --- 스왑 1GB (e2-micro 메모리 1GB 보완) ---
if ! swapon --show | grep -q /swapfile; then
  fallocate -l 1G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# --- Caddy: 사이트별 설정은 /etc/caddy/sites/*.caddy ---
if ! command -v caddy >/dev/null; then
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update && apt-get install -y caddy
fi
mkdir -p /etc/caddy/sites
echo 'import /etc/caddy/sites/*.caddy' > /etc/caddy/Caddyfile
systemctl reload caddy || systemctl restart caddy

# --- PocketBase 인스턴스용 systemd 템플릿: pocketbase@<앱이름> ---
id pocketbase >/dev/null 2>&1 || useradd --system --home /opt/pb --shell /usr/sbin/nologin pocketbase
mkdir -p /opt/pb
cat > /etc/systemd/system/pocketbase@.service <<'EOF'
[Unit]
Description=PocketBase (%i)
After=network.target

[Service]
User=pocketbase
WorkingDirectory=/opt/pb/%i
EnvironmentFile=/opt/pb/%i/app.env
ExecStart=/opt/pb/%i/pocketbase serve --http=127.0.0.1:${PORT} --dir=/opt/pb/%i/pb_data --migrationsDir=/opt/pb/%i/pb_migrations --hooksDir=/opt/pb/%i/pb_hooks
Restart=always
RestartSec=3
LimitNOFILE=4096

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload

echo "서버 기본 설정 완료. 앱 추가: sudo bash add-pb-app.sh <앱이름> <포트> <도메인> <마이그레이션폴더>"
