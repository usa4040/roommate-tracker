# Renderデプロイ手順

このガイドでは、Renderを使ってルームメイト支払い管理アプリをデプロイする手順を説明します。

## 📋 前提条件

- GitHubアカウント
- Renderアカウント（無料）
- このプロジェクトのコード

## 🚀 デプロイ手順

### ステップ1: GitHubにコードをプッシュ

1. **GitHubで新しいリポジトリを作成**
   - https://github.com/new にアクセス
   - リポジトリ名を入力（例: `roommate-tracker`）
   - PublicまたはPrivateを選択
   - 「Create repository」をクリック

2. **ローカルのコードをプッシュ**
   ```bash
   cd /Users/home/project/ああ/roommate-tracker
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/あなたのユーザー名/roommate-tracker.git
   git push -u origin main
   ```

### ステップ2: Renderでバックエンドをデプロイ

1. **Renderにログイン**
   - https://render.com にアクセス
   - GitHubアカウントでサインアップ/ログイン

2. **新しいWeb Serviceを作成**
   - ダッシュボードで「New +」→「Web Service」をクリック
   - GitHubリポジトリを接続
   - `roommate-tracker`リポジトリを選択

3. **バックエンドの設定**
   ```
   Name: roommate-tracker-api
   Region: Singapore (または最寄りのリージョン)
   Branch: main
   Root Directory: server
   Runtime: Node
   Build Command: npm install
   Start Command: node server.js
   Instance Type: Free
   ```

4. **環境変数を設定**
   - 「Environment」タブをクリック
   - 以下を追加:
     ```
     Key: NODE_ENV
     Value: production
     ```
   - 「Save Changes」をクリック

5. **デプロイ**
   - 「Create Web Service」をクリック
   - デプロイが完了するまで待つ（5-10分）
   - デプロイ完了後、URLをコピー（例: `https://roommate-tracker-api.onrender.com`）

### ステップ3: Renderでフロントエンドをデプロイ

1. **新しいStatic Siteを作成**
   - ダッシュボードで「New +」→「Static Site」をクリック
   - 同じGitHubリポジトリを選択

2. **フロントエンドの設定**
   ```
   Name: roommate-tracker-app
   Branch: main
   Root Directory: client
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

3. **環境変数を設定**
   - 「Environment」タブをクリック
   - 以下を追加（バックエンドのURLを使用）:
     ```
     Key: VITE_API_URL
     Value: https://roommate-tracker-api.onrender.com/api
     ```
   - 「Save Changes」をクリック

4. **デプロイ**
   - 「Create Static Site」をクリック
   - デプロイが完了するまで待つ（5-10分）
   - デプロイ完了後、URLをコピー（例: `https://roommate-tracker-app.onrender.com`）

### ステップ4: バックエンドのCORS設定を更新

1. **Renderのバックエンドサービスに戻る**
   - 「Environment」タブをクリック
   - 新しい環境変数を追加:
     ```
     Key: CLIENT_URL
     Value: https://roommate-tracker-app.onrender.com
     ```
   - 「Save Changes」をクリック
   - サービスが自動的に再デプロイされます

### ステップ5: 動作確認

1. フロントエンドのURL（`https://roommate-tracker-app.onrender.com`）にアクセス
2. ユーザーを追加してみる
3. 経費を追加してみる
4. 収支が正しく表示されることを確認

## 🎉 完了！

これで、あなたと友人がどこからでもアクセスできるようになりました！

**アプリのURL:**
- フロントエンド: `https://roommate-tracker-app.onrender.com`

このURLを友人と共有してください。

## ⚠️ 重要な注意事項

### 無料プランの制限
- **スリープ機能**: 15分間アクセスがないとサービスがスリープします
- **起動時間**: スリープから復帰するのに30秒〜1分かかります
- **月間制限**: 750時間/月まで無料（2人で使うには十分）

### データの永続化
- SQLiteデータベースは自動的に保存されます
- ただし、無料プランではサービスを削除するとデータも消えます
- 定期的にバックアップを取ることをおすすめします

## 🔄 更新方法

コードを変更した場合:

1. **変更をGitHubにプッシュ**
   ```bash
   git add .
   git commit -m "変更内容の説明"
   git push
   ```

2. **Renderが自動的に再デプロイ**
   - GitHubにプッシュすると自動的にデプロイされます
   - 手動で再デプロイする場合は、Renderのダッシュボードで「Manual Deploy」→「Deploy latest commit」をクリック

## 📱 スマホからのアクセス

- iPhoneやAndroidのブラウザから同じURLにアクセスできます
- ホーム画面に追加すれば、アプリのように使えます

### iPhoneの場合:
1. Safariでアプリを開く
2. 共有ボタン（□に↑）をタップ
3. 「ホーム画面に追加」を選択

### Androidの場合:
1. Chromeでアプリを開く
2. メニュー（⋮）をタップ
3. 「ホーム画面に追加」を選択

## 🆘 トラブルシューティング

### アプリが表示されない
- Renderのダッシュボードでログを確認
- 環境変数が正しく設定されているか確認
- ブラウザのキャッシュをクリア

### データが保存されない
- バックエンドのURLが正しいか確認
- ブラウザの開発者ツールでネットワークエラーを確認

### 起動が遅い
- 無料プランではスリープから復帰するのに時間がかかります
- 有料プラン（$7/月）にアップグレードするとスリープしなくなります

## 💡 ヒント

- **定期的にアクセス**: 毎日使えばスリープしにくくなります
- **ブックマーク**: URLをブックマークしておくと便利
- **通知**: 友人にもURLを共有して、両方からアクセスできるようにしましょう

---

何か問題があれば、Renderのドキュメントを参照してください:
https://render.com/docs
