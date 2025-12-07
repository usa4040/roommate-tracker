# 本番環境セキュリティガイド

## 🔒 セキュリティのベストプラクティス

### 1. 環境変数の設定

本番環境では、以下の環境変数を必ず設定してください：

```bash
# 必須
NODE_ENV=production
JWT_SECRET=your-very-secure-random-secret-key-here
DATABASE_URL=your-postgresql-connection-string

# オプション
CLIENT_URL=https://your-frontend-domain.com
PORT=3001
```

#### JWT_SECRETの生成方法

安全なランダムキーを生成してください：

```bash
# Node.jsで生成
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# OpenSSLで生成
openssl rand -hex 64
```

### 2. デフォルト管理者アカウント

**重要**: 本番環境では、デフォルトの管理者アカウント（admin@example.com）は**自動的に作成されません**。

#### 初回管理者アカウントの作成

1. **登録エンドポイントを使用**:
   ```bash
   curl -X POST https://your-api-domain.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "管理者名",
       "email": "admin@yourdomain.com",
       "password": "強力なパスワード"
     }'
   ```

2. **データベースで直接roleを更新**:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'admin@yourdomain.com';
   ```

### 3. パスワードポリシー

本番環境では、より強力なパスワードポリシーを実装することを推奨します：

- 最小8文字以上（現在は6文字）
- 大文字、小文字、数字、記号を含む
- よくあるパスワードの禁止
- パスワード履歴の管理

### 4. HTTPS の使用

本番環境では必ずHTTPSを使用してください：

- Let's Encryptで無料のSSL証明書を取得
- Renderなどのホスティングサービスは自動的にHTTPSを提供

### 5. CORS設定

`server/server.ts`のCORS設定を本番ドメインに制限してください：

```typescript
const corsOptions = {
    origin: process.env.CLIENT_URL || 'https://your-frontend-domain.com',
    credentials: true
};
```

### 6. レート制限

本番環境では、ブルートフォース攻撃を防ぐためにレート制限を実装してください：

```bash
npm install express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分
    max: 5, // 最大5回の試行
    message: 'ログイン試行回数が多すぎます。15分後に再試行してください。'
});

app.post('/api/auth/login', loginLimiter, async (req, res) => {
    // ...
});
```

### 7. セキュリティヘッダー

Helmetを使用してセキュリティヘッダーを追加：

```bash
npm install helmet
```

```typescript
import helmet from 'helmet';
app.use(helmet());
```

### 8. データベースバックアップ

定期的なバックアップを設定してください：

- PostgreSQLの自動バックアップ機能を有効化
- 重要なデータは複数の場所に保存
- バックアップからの復元手順をテスト

### 9. ログとモニタリング

- アプリケーションログを記録
- 不審なアクティビティを監視
- エラー追跡サービス（Sentry等）の使用

### 10. 定期的なセキュリティ更新

```bash
# 依存関係の脆弱性チェック
npm audit

# 自動修正
npm audit fix

# パッケージの更新
npm update
```

## 🚨 緊急時の対応

### アカウントが侵害された場合

1. すぐにJWT_SECRETを変更（全ユーザーがログアウトされます）
2. 侵害されたアカウントのパスワードをリセット
3. ログを確認して不正アクセスの範囲を特定
4. 必要に応じてデータベースをバックアップから復元

### データベース接続の問題

1. DATABASE_URL環境変数を確認
2. PostgreSQLサーバーの状態を確認
3. 接続プールの設定を確認
4. ログでエラーメッセージを確認

## 📋 チェックリスト

本番環境デプロイ前に確認：

- [ ] NODE_ENV=production が設定されている
- [ ] JWT_SECRETが安全なランダム値に設定されている
- [ ] DATABASE_URLが正しく設定されている
- [ ] HTTPSが有効になっている
- [ ] CORS設定が本番ドメインに制限されている
- [ ] デフォルト管理者アカウントが作成されていない
- [ ] 初回管理者アカウントを手動で作成した
- [ ] レート制限が実装されている
- [ ] セキュリティヘッダーが設定されている
- [ ] データベースバックアップが設定されている
- [ ] ログとモニタリングが設定されている
- [ ] 依存関係の脆弱性がない（npm audit）

## 📚 参考資料

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
