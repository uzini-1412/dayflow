#!/usr/bin/env bash
# VM 에 PocketBase 앱 하나 추가/업데이트 (server-setup.sh 실행 후 사용)
# 사용: sudo bash add-pb-app.sh <앱이름> <포트> <도메인> <마이그레이션폴더> [PB버전]
#   예) sudo bash add-pb-app.sh dayflow 8090 dayflow.34-168-96-154.sslip.io ./pb_migrations 0.39.4
# 재실행하면 마이그레이션·바이너리만 갱신하고 데이터(pb_data)는 유지한다.
set -euo pipefail

NAME=${1:?앱 이름}
PORT=${2:?내부 포트 (앱마다 다르게: 8090, 8091, ...)}
DOMAIN=${3:?도메인 (예: dayflow.34-168-96-154.sslip.io)}
MIGRATIONS=${4:?마이그레이션 폴더}
PB_VERSION=${5:-0.39.4}
DIR=/opt/pb/$NAME
ARCH=$(dpkg --print-architecture)   # amd64 | arm64

mkdir -p "$DIR/pb_migrations" "$DIR/pb_hooks"
curl -fsSL -o /tmp/pb.zip \
  "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_${ARCH}.zip"
unzip -o -q /tmp/pb.zip pocketbase -d "$DIR" && rm /tmp/pb.zip
cp "$MIGRATIONS"/*.js "$DIR/pb_migrations/"
echo "PORT=$PORT" > "$DIR/app.env"
chown -R pocketbase:pocketbase "$DIR"

systemctl enable pocketbase@"$NAME"
systemctl restart pocketbase@"$NAME"   # 기동 시 미적용 마이그레이션 자동 적용

cat > /etc/caddy/sites/"$NAME".caddy <<EOF
$DOMAIN {
  request_body {
    max_size 20MB
  }
  reverse_proxy 127.0.0.1:$PORT
}
EOF
systemctl reload caddy

echo
echo "완료: https://$DOMAIN  (관리자: https://$DOMAIN/_/)"
echo "관리자 생성: sudo -u pocketbase $DIR/pocketbase superuser upsert <email> <password> --dir=$DIR/pb_data"
