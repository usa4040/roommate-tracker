# ルームメイト支払い管理アプリ

ルームシェアにおける家賃・光熱費などの共同経費を管理するためのWebアプリケーションです。

## 📋 目次

- [プロジェクト概要](#プロジェクト概要)
- [ディレクトリ構造](#ディレクトリ構造)
- [技術スタック](#技術スタック)
- [セットアップ](#セットアップ)
- [動作の仕組み](#動作の仕組み)
- [主要コンポーネント](#主要コンポーネント)
- [データフロー](#データフロー)
- [API仕様](#api仕様)

## 🎯 プロジェクト概要

このアプリは、ルームメイト間での経費の支払いを追跡し、誰が誰にいくら支払うべきかを自動計算します。

**主な機能:**
- ✅ ルームメイトの管理（追加・編集・削除）
- ✅ 経費の記録（誰が何にいくら払ったか）
- ✅ 自動で収支を計算し、精算額を表示
- ✅ 取引履歴の表示
- ✅ 日本語UI

## 📂 ディレクトリ構造

```
roommate-tracker/
├── client/                    # フロントエンド (React + Vite)
│   ├── public/               # 静的ファイル
│   ├── src/
│   │   ├── components/       # Reactコンポーネント
│   │   │   ├── Layout.jsx           # レイアウト（ヘッダーなど）
│   │   │   ├── Dashboard.jsx        # 収支サマリー
│   │   │   ├── UserManagement.jsx   # ルームメイト管理
│   │   │   ├── AddTransaction.jsx   # 経費追加フォーム
│   │   │   └── TransactionList.jsx  # 取引履歴
│   │   ├── hooks/
│   │   │   └── useData.js           # データ取得・操作のカスタムフック
│   │   ├── App.jsx          # ルートコンポーネント
│   │   ├── index.css        # グローバルスタイル
│   │   └── main.jsx         # エントリーポイント
│   ├── index.html
│   ├── vite.config.js       # Vite設定
│   └── package.json
│
├── server/                   # バックエンド (Node.js + Express)
│   ├── db.js                # SQLiteデータベース接続
│   ├── init-db.js           # DB初期化・テストデータ投入
│   ├── server.js            # APIサーバー
│   └── package.json
│
├── expenses.db              # SQLiteデータベースファイル（自動生成）
├── package.json             # ルートpackage.json（開発用スクリプト）
└── README.md                # このファイル
```

## 🛠 技術スタック

### フロントエンド
- **React 18** - UIライブラリ
- **Vite** - 高速ビルドツール
- **Lucide React** - アイコンライブラリ
- **Vanilla CSS** - カスタムデザインシステム

### バックエンド
- **Node.js** - ランタイム
- **Express** - Webフレームワーク
- **SQLite3** - データベース
- **CORS** - クロスオリジン対応
- **Nodemon** - 開発時の自動再起動

### 開発ツール
- **Concurrently** - フロント・バックエンドの同時起動

## 🚀 セットアップ

### 前提条件
- Node.js (v20.19+ または v22.12+)
- npm

### インストール手順

1. **依存関係のインストール**
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   cd ..
   ```

2. **データベースの初期化**
   ```bash
   cd server
   node init-db.js
   cd ..
   ```

3. **開発サーバーの起動**
   ```bash
   npm run dev
   ```

4. **ブラウザで開く**
   - フロントエンド: http://localhost:5173
   - バックエンド: http://localhost:3001

## ⚙️ 動作の仕組み

### アーキテクチャ概要

```
┌─────────────┐         HTTP         ┌─────────────┐         SQL         ┌──────────┐
│   Browser   │ ←─────────────────→ │   Express   │ ←──────────────→  │  SQLite  │
│   (React)   │    REST API (JSON)   │   Server    │                    │    DB    │
└─────────────┘                       └─────────────┘                    └──────────┘
```

### データフロー

1. **初期読み込み**
   - Reactアプリが起動すると、`useData`フックが自動的にAPIを呼び出す
   - `/api/users`, `/api/transactions`, `/api/balance`から全データを取得
   - 取得したデータをReactのstateに保存

2. **経費の追加**
   - ユーザーがフォームに入力 → `AddTransaction`コンポーネント
   - `POST /api/transactions`でサーバーに送信
   - サーバーがSQLiteにデータを保存
   - 成功後、全データを再取得して画面を更新

3. **収支の計算**
   - サーバー側で全ユーザーの支払い総額を集計
   - 総額 ÷ 人数 = 一人あたりの負担額
   - 各ユーザーの支払額 - 負担額 = 収支
   - プラスなら「受取予定」、マイナスなら「支払予定」

### データベーススキーマ

```sql
-- ユーザーテーブル
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    avatar TEXT
);

-- 取引テーブル
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payer_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    description TEXT,
    date TEXT,
    FOREIGN KEY (payer_id) REFERENCES users(id)
);
```

## 🧩 主要コンポーネント

### 1. Layout.jsx
**役割:** アプリ全体のレイアウトを提供

```javascript
// ヘッダー（ロゴとタイトル）と子コンポーネントを表示
<Layout>
  {children}
</Layout>
```

### 2. Dashboard.jsx
**役割:** 収支サマリーの表示

**受け取るProps:**
- `balance` - 各ユーザーの収支データ
- `users` - ユーザー一覧

**表示内容:**
- 各ユーザーの支払額
- 受取予定額 / 支払予定額
- 精算済みの表示

**計算ロジック:**
```javascript
// プラスの場合：この人が受け取る金額
// マイナスの場合：この人が支払う金額
const isOwed = b.diff > 0;
```

### 3. UserManagement.jsx
**役割:** ルームメイトの管理

**機能:**
- ユーザーの追加
- ユーザー名の編集（名前をクリック）
- ユーザーの削除（×ボタン）

**受け取るProps:**
- `users` - ユーザー一覧
- `onAddUser(name)` - ユーザー追加関数
- `onUpdateUser(id, name)` - ユーザー更新関数
- `onDeleteUser(id)` - ユーザー削除関数

**削除時の安全機能:**
```javascript
// 取引履歴があるユーザーは削除できない
if (!success) {
    alert('ユーザーの削除に失敗しました。取引履歴がある可能性があります。');
}
```

### 4. AddTransaction.jsx
**役割:** 経費の記録フォーム

**フォーム項目:**
1. 誰が支払ったか（複数ボタンから選択）
2. 金額（数値入力）
3. 内容（テキスト入力）
4. 日付（日付ピッカー）

**開閉式UI:**
- 閉じている時：「経費を追加」ボタン
- 開いている時：入力フォーム

### 5. TransactionList.jsx
**役割:** 取引履歴の表示

**表示内容:**
- 経費の内容
- 支払った人
- 日付
- 金額

**データソート:**
```javascript
// サーバー側で日付の降順で取得
ORDER BY date DESC
```

### 6. useData.js (カスタムフック)
**役割:** データの取得と操作を一元管理

**提供する機能:**
```javascript
const { 
  users,              // ユーザー一覧
  transactions,       // 取引一覧
  balance,            // 収支データ
  loading,            // 読み込み中フラグ
  error,              // エラーメッセージ
  addTransaction,     // 経費追加
  addUser,            // ユーザー追加
  updateUser,         // ユーザー更新
  deleteUser,         // ユーザー削除
  refresh             // データ再取得
} = useData();
```

**実装パターン:**
```javascript
// 操作後は必ずデータを再取得
const addTransaction = async (transaction) => {
    const res = await fetch(...);
    await fetchData();  // 再取得
    return true;
};
```

## 🔄 データフロー

### 起動時のデータ取得フロー
```
1. App.jsx マウント
    ↓
2. useData() 実行
    ↓
3. useEffect でfetchData()実行
    ↓
4. 並列で3つのAPIリクエスト
   - GET /api/users
   - GET /api/transactions
   - GET /api/balance
    ↓
5. データをstateに保存
    ↓
6. 各コンポーネントに props として渡す
```

### 経費追加時のフロー
```
1. AddTransaction で「保存」クリック
    ↓
2. onAdd(formData) 実行
    ↓
3. useData の addTransaction() 実行
    ↓
4. POST /api/transactions
    ↓
5. サーバーがDBに保存
    ↓
6. fetchData() で全データ再取得
    ↓
7. 画面が自動更新
```

### 収支計算のフロー
```
1. GET /api/balance リクエスト
    ↓
2. サーバー側で計算:
   - 全トランザクションを集計
   - 各ユーザーの支払い総額を取得
   - 総額 ÷ ユーザー数 = 一人当たりの負担額
   - 支払い総額 - 負担額 = 収支
    ↓
3. 結果をJSON形式で返す:
   {
     user_id: 1,
     paid: 1000,      // この人が支払った額
     diff: 500        // 収支（プラスなら受取、マイナスなら支払）
   }
    ↓
4. Dashboard が受け取って表示
```

## 📡 API仕様

### ユーザー関連

#### GET /api/users
全ユーザーを取得

**レスポンス:**
```json
{
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "ユーザーA",
      "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=ユーザーA"
    }
  ]
}
```

#### POST /api/users
新しいユーザーを作成

**リクエスト:**
```json
{
  "name": "新しいユーザー",
  "avatar": "https://..." // オプション
}
```

**レスポンス:**
```json
{
  "message": "success",
  "id": 3,
  "data": { ... }
}
```

#### PUT /api/users/:id
ユーザー名を更新

**リクエスト:**
```json
{
  "name": "更新後の名前"
}
```

#### DELETE /api/users/:id
ユーザーを削除

**制約:** 取引履歴があるユーザーは削除不可

### 取引関連

#### GET /api/transactions
全取引を取得（日付降順）

**レスポンス:**
```json
{
  "message": "success",
  "data": [
    {
      "id": 1,
      "payer_id": 1,
      "payer_name": "ユーザーA",
      "amount": 1000,
      "description": "家賃",
      "date": "2025-11-27"
    }
  ]
}
```

#### POST /api/transactions
新しい取引を追加

**リクエスト:**
```json
{
  "payer_id": 1,
  "amount": 1000,
  "description": "家賃",
  "date": "2025-11-27"
}
```

### 収支関連

#### GET /api/balance
全ユーザーの収支を取得

**レスポンス:**
```json
{
  "message": "success",
  "data": [
    {
      "user_id": 1,
      "paid": 1000,
      "diff": 500
    }
  ],
  "total_spent": 1000,
  "share_per_person": 500
}
```

## 🎨 デザインシステム

### カラーパレット
```css
--bg-primary: #0f172a;        /* ダークブルー背景 */
--bg-secondary: #1e293b;      /* カード背景 */
--text-primary: #f1f5f9;      /* メインテキスト */
--text-secondary: #94a3b8;    /* 補助テキスト */
--accent-primary: #8b5cf6;    /* アクセントカラー（紫） */
```

### デザイン特徴
- **ダークモード**: 目に優しいダークテーマ
- **グラスモーフィズム**: 半透明のカード
- **アニメーション**: フェードイン、ホバーエフェクト
- **グラデーション**: アクセント要素に使用
- **日本語フォント**: システムフォントで最適化

## 📝 開発のポイント

### 1. 状態管理
- Reactの`useState`と`useEffect`のみを使用
- 複雑な状態管理ライブラリは不要
- カスタムフック`useData`で一元管理

### 2. エラーハンドリング
```javascript
try {
    const res = await fetch(...);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
} catch (err) {
    setError(err.message);
}
```

### 3. 自動再取得
- データ変更後は必ず`fetchData()`を実行
- 常に最新のデータを表示

### 4. モーダル実装
- `window.confirm`ではなくカスタムモーダル
- 状態管理で表示/非表示を制御

## 🔧 今後の拡張案

- [ ] ユーザー認証機能
- [ ] 経費のカテゴリ分類
- [ ] グラフによる可視化
- [ ] 支払い履歴のエクスポート（CSV）
- [ ] 複数のルームシェア管理
- [ ] 精算リマインダー機能
- [ ] レスポンシブデザインの改善

## 📄 ライセンス

MIT

## 🙋 サポート

質問や問題がある場合は、GitHubのIssuesでお知らせください。
