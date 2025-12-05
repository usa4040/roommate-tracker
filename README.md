# ルームメイト支払い管理アプリ

[![CI/CD Pipeline](https://github.com/usa4040/roommate-tracker/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/usa4040/roommate-tracker/actions/workflows/ci-cd.yml)
[![Tests](https://img.shields.io/badge/tests-77%20passing-success)](https://github.com/usa4040/roommate-tracker)
[![Coverage](https://img.shields.io/badge/coverage-61.81%25-yellow)](https://github.com/usa4040/roommate-tracker)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

ルームメイト間の経費と返済を管理するWebアプリケーションです。リアルタイム同期機能により、複数のユーザーが同時に利用できます。

## ✨ 機能

- 📝 **経費の記録**: 誰がいくら支払ったかを簡単に記録
- ✏️ **経費の編集**: 記録した経費を後から修正可能
- 💰 **返済の管理**: ルームメイト間の返済を追跡
- ✏️ **返済の編集**: 記録した返済を後から修正可能
- 📊 **収支サマリー**: 各ユーザーの収支を一目で確認
- 🔄 **リアルタイム同期**: Socket.IOによる即時更新
- ✅ **データ検証**: Zodによる堅牢なバリデーション
- 🎨 **モダンUI**: レスポンシブで美しいインターフェース
- 🗑️ **削除確認**: 誤削除を防ぐ確認モーダル

## 🧪 テスト

このプロジェクトは包括的なテストカバレッジを持っています：

### テスト統計

- **バックエンド**: 36 tests (Jest + Supertest)
  - ユニットテスト: 18 tests (スキーマバリデーション)
  - 統合テスト: 18 tests (API エンドポイント)
- **フロントエンド**: 41 tests (Vitest + React Testing Library)
  - ユニットテスト: 8 tests (スキーマバリデーション)
  - コンポーネントテスト: 33 tests (UI コンポーネント)
- **合計**: **77 passing tests** ✅

### カバレッジ

| カテゴリ | カバレッジ | 評価 |
|---------|-----------|------|
| **全体** | 61.81% | 良好 |
| schemas.ts | 100% | 完璧 ✅ |
| Layout.tsx | 100% | 完璧 ✅ |
| Dashboard.tsx | 90.9% | 優秀 ✅ |
| UserManagement.tsx | 71.79% | 良好 ✅ |
| TransactionList.tsx | 66.66% | 良好 |
| AddTransaction.tsx | 32.55% | 改善の余地 |

### テストの実行

```bash
# バックエンドテスト
cd server
npm test

# フロントエンドテスト
cd client
npm test

# カバレッジレポート生成
npm run test:coverage
```

詳細については、[TESTING.md](TESTING.md) を参照してください。

## 📚 ドキュメント

- **[API.md](API.md)** - RESTful API仕様とエンドポイント詳細
- **[TESTING.md](TESTING.md)** - テスト戦略とテストの書き方
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - コントリビューションガイドライン
- **[LICENSE](LICENSE)** - MITライセンス

## 🚀 技術スタック

### フロントエンド
- **React** - UIライブラリ
- **TypeScript** - 型安全性
- **Vite** - 高速ビルドツール
- **Socket.IO Client** - リアルタイム通信
- **Zod** - スキーマバリデーション
- **React Hot Toast** - 通知システム
- **Lucide React** - アイコン

### バックエンド
- **Node.js** - ランタイム
- **Express** - Webフレームワーク
- **TypeScript** - 型安全性
- **Socket.IO** - リアルタイム通信
- **PostgreSQL** - 本番データベース
- **SQLite** - 開発用データベース
- **Zod** - データバリデーション

### テスト
- **Jest** - バックエンドテストフレームワーク
- **Vitest** - フロントエンドテストフレームワーク
- **Supertest** - API統合テスト
- **React Testing Library** - コンポーネントテスト

### CI/CD
- **GitHub Actions** - 自動テスト・デプロイ
- **Render** - ホスティングプラットフォーム

## 📦 セットアップ

### 前提条件
- Node.js 22.x 以上
- npm または yarn

### インストール

1. リポジトリをクローン
```bash
git clone https://github.com/usa4040/roommate-tracker.git
cd roommate-tracker
```

2. バックエンドのセットアップ
```bash
cd server
npm install
npm run dev
```

3. フロントエンドのセットアップ（別のターミナルで）
```bash
cd client
npm install
npm run dev
```

4. ブラウザで開く
```
http://localhost:5174
```

## 🌐 本番環境

本番環境では以下の設定が必要です：

### 環境変数

**バックエンド (`server/.env`)**
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:password@host:port/database
CLIENT_URL=https://your-frontend-url.com
```

**フロントエンド (`client/.env`)**
```env
VITE_API_URL=https://your-backend-url.com/api
```

## 🔄 CI/CD パイプライン

このプロジェクトは GitHub Actions を使用した自動化されたCI/CDパイプラインを持っています：

### ワークフロー

1. **テスト実行**
   - バックエンドテスト（Jest）
   - フロントエンドテスト（Vitest）
   - カバレッジレポート生成

2. **ビルドチェック**
   - バックエンドビルド検証
   - フロントエンドビルド検証

3. **自動デプロイ**
   - mainブランチへのpush時に自動デプロイ
   - Renderへのデプロイフック

### デプロイ設定

Renderでの自動デプロイを有効にするには、GitHubリポジトリのSecretsに以下を設定：

```
RENDER_DEPLOY_HOOK_URL=https://api.render.com/deploy/srv-xxxxx
```

## 📝 開発ワークフロー

1. 新しいブランチを作成
```bash
git checkout -b feature/your-feature
```

2. 変更を実装し、テストを追加

3. テストが通ることを確認
```bash
npm test
```

4. コミットしてプッシュ
```bash
git add .
git commit -m "✨ Add your feature"
git push origin feature/your-feature
```

5. Pull Requestを作成
   - CI/CDが自動的にテストを実行
   - 全てのテストが通ったらマージ可能

## 🤝 コントリビューション

プルリクエストを歓迎します！大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 👥 作者

- GitHub: [@usa4040](https://github.com/usa4040)

## 🙏 謝辞

- [React](https://react.dev/)
- [Express](https://expressjs.com/)
- [Socket.IO](https://socket.io/)
- [Zod](https://zod.dev/)
- [Render](https://render.com/)
