#!/usr/bin/env bash
# Oracle Cloud(Ubuntu) VM 에 PocketBase + Caddy(HTTPS 자동) 설치
# 사용: 이 폴더(deploy/)와 pb_migrations/ 를 VM 에 복사한 뒤
#   sudo bash server-setup.sh <도메인>      예) sudo bash server-setup.sh 1-2-3-4.sslip.io
# 도메인이 없으면 공인 IP 를 sslip.io 형태로 사용 (1.2.3.4 → 1-2-3-4.sslip.io)
set -euo pipefail

PB_VERSION=0.39.4
DOMAIN=${1:?도메인을 인자로 넘겨주세요 (예: 1-2-3-4.sslip.io)}
SRC=$(cd "$(dirname "$0")" && pwd)
PB_DIR=/opt/pocketbase
export DEBIAN_FRONTEND=noninteractive   # iptables-persistent 설치 시 대화상자 방지

apt-get update
apt-get install -y unzip curl gpg debian-keyring debian-archive-keyring apt-transport-https iptables-persistent

# --- 방화벽: Oracle Ubuntu 이미지는 iptables 가 80/443 을 기본 차단 ---
for port in 80 443; do
  iptables -C INPUT -p tcp --dport "$port" -m state --state NEW -j ACCEPT 2>/dev/null \
    || iptables -I INPUT 6 -p tcp --dport "$port" -m state --state NEW -j ACCEPT
done
netfilter-persistent save

# --- PocketBase ---
ARCH=$(dpkg --print-architecture)   # amd64 | arm64
id pocketbase >/dev/null 2>&1 || useradd --system --home "$PB_DIR" --shell /usr/sbin/nologin pocketbase
mkdir -p "$PB_DIR/pb_migrations"
curl -fsSL -o /tmp/pb.zip \
  "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_${ARCH}.zip"
unzip -o /tmp/pb.zip pocketbase -d "$PB_DIR" && rm /tmp/pb.zip
cp "$SRC"/../pb_migrations/*.js "$PB_DIR/pb_migrations/"
chown -R pocketbase:pocketbase "$PB_DIR"

cat > /etc/systemd/system/pocketbase.service <<EOF
[Unit]
Description=PocketBase
After=network.target

[Service]
User=pocketbase
WorkingDirectory=$PB_DIR
ExecStart=$PB_DIR/pocketbase serve --http=127.0.0.1:8090 --dir=$PB_DIR/pb_data --migrationsDir=$PB_DIR/pb_migrations
Restart=always
RestartSec=3
LimitNOFILE=4096

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now pocketbase

# --- Caddy: Let's Encrypt 인증서 자동 발급 + 리버스 프록시 ---
if ! command -v caddy >/dev/null; then
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update && apt-get install -y caddy
fi

cat > /etc/caddy/Caddyfile <<EOF
$DOMAIN {
  request_body {
    max_size 20MB
  }
  reverse_proxy 127.0.0.1:8090
}
EOF
systemctl reload caddy || systemctl restart caddy

echo
echo "완료: https://$DOMAIN"
echo "관리자 생성: sudo -u pocketbase $PB_DIR/pocketbase superuser upsert <email> <password> --dir=$PB_DIR/pb_data"
