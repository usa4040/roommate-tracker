# Renderデプロイ手順（PostgreSQL版）

PostgreSQLデータベースを使用したデプロイ手順です。

## 📋 前提条件

- GitHubにコードがプッシュ済み
- Renderアカウント作成済み
- バックエンドとフロントエンドがデプロイ済み

## 🗄️ PostgreSQLデータベースの作成

### ステップ1: Renderでデータベースを作成

1. **Renderダッシュボードにアクセス**
   - https://dashboard.render.com

2. **新しいPostgreSQLを作成**
   - 「New +」→「PostgreSQL」をクリック

3. **データベースの設定**
   ```
   Name: roommate-tracker-db
   Database: roommate_tracker
   User: (自動生成)
   Region: Singapore (バックエンドと同じリージョン)
   PostgreSQL Version: 16 (最新版)
   Instance Type: Free
   ```

4. **作成**
   - 「Create Database」をクリック
   - 作成完了まで1-2分待つ

5. **接続情報をコピー**
   - データベースのページで「Internal Database URL」をコピー
   - 例: `postgresql://user:password@hostname/database`

### ステップ2: バックエンドに環境変数を追加

1. **バックエンドサービスに移動**
   - `roommate-tracker-api` をクリック

2. **Environment タブを開く**

3. **新しい環境変数を追加**
   ```
   Key: DATABASE_URL
   Value: (コピーしたInternal Database URL)
   ```

4. **保存して再デプロイ**
   - 「Save Changes」をクリック
   - 自動的に再デプロイされます（2-3分）

### ステップ3: 動作確認

1. **フロントエンドにアクセス**
   - https://roommate-tracker-app.onrender.com

2. **データの永続性を確認**
   - ユーザーを追加
   - 経費を追加
   - ブラウザを閉じる
   - 数時間後に再度アクセス
   - データが残っていることを確認

## ✅ 完了！

これで、データが永続的に保存されるようになりました。

## 🔄 ローカル開発環境

ローカルではSQLiteを使用し、本番環境ではPostgreSQLを使用するように設定されています。

**ローカルで開発する場合:**
```bash
npm run dev
```

SQLiteが自動的に使用されます。環境変数の設定は不要です。

## 📊 データベースの管理

### データの確認
Renderのダッシュボードから：
1. データベース（`roommate-tracker-db`）を選択
2. 「Connect」タブで接続情報を確認
3. psqlやTablePlusなどのツールで接続可能

### バックアップ
無料プランでは自動バックアップはありませんが、手動でエクスポート可能です。

## ⚠️ 注意事項

### 無料プランの制限
- **ストレージ**: 1GB まで
- **有効期限**: 90日間アクティビティがないと削除される
- **接続数**: 最大97接続

### データの保護
- 定期的にデータをエクスポートすることをおすすめします
- 重要なデータは別途バックアップを取ってください

## 🆘 トラブルシューティング

### データベース接続エラー
- `DATABASE_URL`が正しく設定されているか確認
- Renderのログで詳細なエラーを確認

### データが保存されない
- バックエンドのログを確認
- データベースの接続状態を確認

---

何か問題があれば、Renderのサポートドキュメントを参照してください:
https://render.com/docs/databases
