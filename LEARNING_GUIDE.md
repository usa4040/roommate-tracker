# 🎓 Roommate Tracker プログラミング学習ガイド

このガイドは、Roommate Trackerプロジェクトを通じてプログラミングを学習するための包括的なロードマップです。初心者から中級者まで、段階的に学習できるように設計されています。

## 📋 目次

1. [学習の前提条件](#学習の前提条件)
2. [プロジェクト概要](#プロジェクト概要)
3. [学習ロードマップ](#学習ロードマップ)
4. [レベル別学習パス](#レベル別学習パス)
5. [実践的な学習課題](#実践的な学習課題)
6. [参考リソース](#参考リソース)

---

## 🎯 学習の前提条件

### 必須知識
- ✅ HTML/CSSの基礎
- ✅ JavaScriptの基本文法
- ✅ コマンドライン操作の基礎

### 推奨知識
- 📚 TypeScriptの基礎（学習しながらでもOK）
- 📚 Reactの基本概念（学習しながらでもOK）
- 📚 Node.jsの基礎（学習しながらでもOK）

---

## 🏗️ プロジェクト概要

### アーキテクチャ

```
roommate-tracker/
├── client/          # フロントエンド (React + TypeScript)
│   ├── src/
│   │   ├── components/    # UIコンポーネント
│   │   ├── contexts/      # React Context (状態管理)
│   │   ├── hooks/         # カスタムフック
│   │   ├── api/           # API通信
│   │   └── types/         # TypeScript型定義
│   └── __tests__/         # フロントエンドテスト
│
└── server/          # バックエンド (Node.js + Express)
    ├── server.ts          # メインサーバーファイル
    ├── db.ts              # データベース操作
    ├── schemas.ts         # バリデーションスキーマ
    ├── auth.ts            # 認証ロジック
    └── __tests__/         # バックエンドテスト
```

### 技術スタック

#### フロントエンド
- **React** - UIを構築するためのライブラリ
- **TypeScript** - 型安全性を提供
- **Vite** - 高速な開発サーバー
- **Socket.IO Client** - リアルタイム通信
- **Zod** - データバリデーション

#### バックエンド
- **Node.js** - JavaScript実行環境
- **Express** - Webフレームワーク
- **PostgreSQL/SQLite** - データベース
- **Socket.IO** - リアルタイム通信
- **Zod** - データバリデーション

---

## 🗺️ 学習ロードマップ

### フェーズ1: 基礎理解（1-2週間）

#### 1.1 プロジェクトのセットアップ
```bash
# リポジトリをクローン
git clone https://github.com/usa4040/roommate-tracker.git
cd roommate-tracker

# バックエンドのセットアップ
cd server
npm install
npm run dev

# フロントエンドのセットアップ（別のターミナル）
cd client
npm install
npm run dev
```

**学習ポイント:**
- 📖 `package.json`の役割を理解する
- 📖 npm/yarnによる依存関係管理
- 📖 開発サーバーの起動方法

#### 1.2 コードベースの探索

**推奨順序:**

1. **README.mdを読む**
   - プロジェクトの全体像を把握
   - 機能一覧を確認

2. **フロントエンドの構造を理解**
   ```
   client/src/
   ├── main.tsx          # エントリーポイント
   ├── App.tsx           # ルートコンポーネント
   ├── components/       # 各UIコンポーネント
   └── contexts/         # グローバル状態管理
   ```

3. **バックエンドの構造を理解**
   ```
   server/
   ├── server.ts         # サーバーのエントリーポイント
   ├── db.ts             # データベース操作
   └── schemas.ts        # データバリデーション
   ```

**実践課題:**
- [ ] アプリを起動して、全ての機能を試す
- [ ] 各ファイルを開いて、コメントを読む
- [ ] わからない用語をメモする

---

### フェーズ2: TypeScript基礎（1-2週間）

#### 2.1 型システムの理解

**学習ファイル:**
- `server/types.ts` - バックエンドの型定義
- `client/src/types/index.ts` - フロントエンドの型定義

**重要な概念:**

```typescript
// 基本的な型定義
interface User {
  id: number;
  name: string;
  email: string;
}

// 型の拡張
interface Transaction {
  id: number;
  userId: number;
  amount: number;
  description: string;
  createdAt: Date;
}
```

**実践課題:**
- [ ] `types.ts`の各インターフェースを理解する
- [ ] 新しい型を追加してみる（例: `Category`型）
- [ ] TypeScriptのエラーメッセージを読んで理解する

#### 2.2 Zodによるバリデーション

**学習ファイル:**
- `server/schemas.ts`
- `client/src/schemas.ts`

**重要な概念:**

```typescript
import { z } from 'zod';

// スキーマ定義
const userSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  email: z.string().email("有効なメールアドレスを入力してください"),
});

// バリデーション実行
const result = userSchema.safeParse(data);
if (!result.success) {
  console.error(result.error);
}
```

**実践課題:**
- [ ] 既存のスキーマを読んで理解する
- [ ] 新しいバリデーションルールを追加する
- [ ] エラーメッセージをカスタマイズする

---

### フェーズ3: React基礎（2-3週間）

#### 3.1 コンポーネントの理解

**学習ファイル（推奨順序）:**

1. **`client/src/components/Layout.tsx`**
   - 最もシンプルなコンポーネント
   - propsの使い方を学ぶ

2. **`client/src/components/Dashboard.tsx`**
   - 状態管理（useState）
   - 副作用（useEffect）
   - データフェッチング

3. **`client/src/components/AddTransaction.tsx`**
   - フォーム処理
   - イベントハンドリング
   - バリデーション

**重要な概念:**

```typescript
// 関数コンポーネント
function MyComponent({ title }: { title: string }) {
  // 状態管理
  const [count, setCount] = useState(0);
  
  // 副作用
  useEffect(() => {
    console.log('コンポーネントがマウントされました');
  }, []);
  
  // イベントハンドラ
  const handleClick = () => {
    setCount(count + 1);
  };
  
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={handleClick}>カウント: {count}</button>
    </div>
  );
}
```

**実践課題:**
- [ ] 各コンポーネントの役割を理解する
- [ ] propsの流れを追跡する
- [ ] 新しいコンポーネントを作成する（例: `Footer`）

#### 3.2 React Context（状態管理）

**学習ファイル:**
- `client/src/contexts/AuthContext.tsx`

**重要な概念:**

```typescript
// Contextの作成
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Providerコンポーネント
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// カスタムフック
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

**実践課題:**
- [ ] AuthContextの仕組みを理解する
- [ ] 新しいContextを作成する（例: `ThemeContext`）
- [ ] Contextを使ってグローバル状態を管理する

#### 3.3 カスタムフック

**学習ファイル:**
- `client/src/hooks/useSocket.ts`

**重要な概念:**

```typescript
// カスタムフックの作成
function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    
    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);
  
  return { isConnected };
}
```

**実践課題:**
- [ ] useSocketフックの仕組みを理解する
- [ ] 新しいカスタムフックを作成する（例: `useLocalStorage`）
- [ ] ロジックの再利用性を考える

---

### フェーズ4: バックエンド基礎（2-3週間）

#### 4.1 Express.jsの理解

**学習ファイル:**
- `server/server.ts`

**重要な概念:**

```typescript
import express from 'express';

const app = express();

// ミドルウェア
app.use(express.json());

// ルート定義
app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});

app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  // データベースに保存
  res.status(201).json({ message: 'ユーザーが作成されました' });
});

// サーバー起動
app.listen(3001, () => {
  console.log('サーバーが起動しました');
});
```

**実践課題:**
- [ ] 各エンドポイントの役割を理解する
- [ ] 新しいエンドポイントを追加する
- [ ] ミドルウェアの仕組みを理解する

#### 4.2 データベース操作

**学習ファイル:**
- `server/db.ts`
- `server/migrations.ts`

**重要な概念:**

```typescript
// データベース接続
import Database from 'better-sqlite3';
const db = new Database('expenses.db');

// クエリ実行
const users = db.prepare('SELECT * FROM users').all();

// パラメータ付きクエリ（SQLインジェクション対策）
const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

// INSERT
const insert = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
insert.run(name, email);
```

**実践課題:**
- [ ] SQLクエリの基本を学ぶ
- [ ] データベーススキーマを理解する
- [ ] 新しいテーブルを追加する（例: `categories`）

#### 4.3 認証とセキュリティ

**学習ファイル:**
- `server/auth.ts`
- `server/authMiddleware.ts`

**重要な概念:**

```typescript
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// パスワードのハッシュ化
const hashedPassword = await bcrypt.hash(password, 10);

// パスワードの検証
const isValid = await bcrypt.compare(password, hashedPassword);

// JWTトークンの生成
const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '7d' });

// トークンの検証
const decoded = jwt.verify(token, SECRET_KEY);
```

**実践課題:**
- [ ] 認証フローを理解する
- [ ] JWTの仕組みを学ぶ
- [ ] セキュリティベストプラクティスを学ぶ

---

### フェーズ5: リアルタイム通信（1-2週間）

#### 5.1 Socket.IOの理解

**学習ファイル:**
- `server/server.ts`（Socket.IO部分）
- `client/src/socket.ts`

**重要な概念:**

```typescript
// サーバー側
io.on('connection', (socket) => {
  console.log('クライアントが接続しました');
  
  socket.on('transaction:create', (data) => {
    // 全クライアントに通知
    io.emit('transaction:created', data);
  });
  
  socket.on('disconnect', () => {
    console.log('クライアントが切断しました');
  });
});

// クライアント側
socket.on('transaction:created', (data) => {
  // UIを更新
  setTransactions([...transactions, data]);
});
```

**実践課題:**
- [ ] Socket.IOの接続フローを理解する
- [ ] イベントの送受信を理解する
- [ ] 新しいリアルタイム機能を追加する

---

### フェーズ6: テスト（2-3週間）

#### 6.1 バックエンドテスト

**学習ファイル:**
- `server/__tests__/schemas.test.ts`
- `server/__tests__/api.test.ts`

**重要な概念:**

```typescript
import { describe, test, expect } from '@jest/globals';

describe('User API', () => {
  test('ユーザーを作成できる', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'テスト太郎', email: 'test@example.com' });
    
    expect(response.status).toBe(201);
    expect(response.body.name).toBe('テスト太郎');
  });
  
  test('無効なデータでエラーになる', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ name: '' });
    
    expect(response.status).toBe(400);
  });
});
```

**実践課題:**
- [ ] 既存のテストを読んで理解する
- [ ] 新しいテストケースを追加する
- [ ] テストカバレッジを確認する

#### 6.2 フロントエンドテスト

**学習ファイル:**
- `client/src/__tests__/Dashboard.test.tsx`
- `client/src/__tests__/AddTransaction.test.tsx`

**重要な概念:**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';

test('ボタンをクリックするとカウントが増える', () => {
  render(<Counter />);
  
  const button = screen.getByRole('button');
  fireEvent.click(button);
  
  expect(screen.getByText('カウント: 1')).toBeInTheDocument();
});
```

**実践課題:**
- [ ] React Testing Libraryの使い方を学ぶ
- [ ] コンポーネントのテストを書く
- [ ] ユーザーインタラクションをテストする

---

## 🎯 レベル別学習パス

### 初級者向け（0-3ヶ月）

**目標:** プロジェクトの全体像を理解し、小さな変更ができるようになる

1. **Week 1-2: 環境構築と探索**
   - [ ] プロジェクトをセットアップ
   - [ ] アプリの全機能を試す
   - [ ] コードを読んで理解する

2. **Week 3-4: HTML/CSS/JavaScript復習**
   - [ ] `index.css`を読んでCSSを理解
   - [ ] JavaScriptの基本構文を復習
   - [ ] TypeScriptの基礎を学ぶ

3. **Week 5-8: React基礎**
   - [ ] シンプルなコンポーネントから読み始める
   - [ ] useState, useEffectを理解
   - [ ] 小さなコンポーネントを作成

4. **Week 9-12: バックエンド基礎**
   - [ ] Express.jsの基本を学ぶ
   - [ ] APIエンドポイントを理解
   - [ ] データベースの基本を学ぶ

### 中級者向け（3-6ヶ月）

**目標:** 新機能を追加し、テストを書けるようになる

1. **Month 1: 高度なReact**
   - [ ] Context APIを使った状態管理
   - [ ] カスタムフックの作成
   - [ ] パフォーマンス最適化

2. **Month 2: バックエンド応用**
   - [ ] 認証システムの理解と実装
   - [ ] データベース設計
   - [ ] エラーハンドリング

3. **Month 3: リアルタイム機能**
   - [ ] Socket.IOの仕組み
   - [ ] リアルタイム同期の実装
   - [ ] WebSocketの理解

4. **Month 4-6: テストとCI/CD**
   - [ ] ユニットテストの書き方
   - [ ] 統合テストの書き方
   - [ ] GitHub Actionsの理解

---

## 💡 実践的な学習課題

### 初級課題

#### 課題1: UIのカスタマイズ
**難易度:** ⭐️

**タスク:**
- [ ] `index.css`の色を変更する
- [ ] ボタンのスタイルを変更する
- [ ] ヘッダーのデザインを変更する

**学習ポイント:**
- CSSの基本
- カラーパレット
- レスポンシブデザイン

#### 課題2: 新しいコンポーネントの追加
**難易度:** ⭐️⭐️

**タスク:**
- [ ] `Footer`コンポーネントを作成
- [ ] 著作権情報を表示
- [ ] `Layout.tsx`に組み込む

**学習ポイント:**
- Reactコンポーネントの作成
- propsの使い方
- コンポーネントの組み合わせ

#### 課題3: バリデーションの追加
**難易度:** ⭐️⭐️

**タスク:**
- [ ] 金額の最大値を設定（例: 100万円）
- [ ] 説明文の最大文字数を設定
- [ ] エラーメッセージを日本語化

**学習ポイント:**
- Zodによるバリデーション
- エラーハンドリング
- ユーザー体験の向上

### 中級課題

#### 課題4: カテゴリー機能の追加
**難易度:** ⭐️⭐️⭐️

**タスク:**
- [ ] カテゴリーテーブルをデータベースに追加
- [ ] カテゴリー管理画面を作成
- [ ] 取引にカテゴリーを紐付ける
- [ ] カテゴリー別の集計を表示

**学習ポイント:**
- データベース設計
- CRUD操作
- リレーショナルデータの扱い
- データの集計

**ヒント:**
```typescript
// 1. データベーススキーマ
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  color TEXT NOT NULL
);

// 2. Transactionテーブルにcategory_idを追加
ALTER TABLE transactions ADD COLUMN category_id INTEGER;

// 3. Zodスキーマ
const categorySchema = z.object({
  name: z.string().min(1),
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
});

// 4. APIエンドポイント
app.get('/api/categories', ...);
app.post('/api/categories', ...);
```

#### 課題5: 検索・フィルター機能
**難易度:** ⭐️⭐️⭐️

**タスク:**
- [ ] 日付範囲で取引を絞り込む
- [ ] ユーザーで絞り込む
- [ ] 金額範囲で絞り込む
- [ ] 検索UIを作成

**学習ポイント:**
- SQLのWHERE句
- フォーム処理
- 状態管理
- URLパラメータ

#### 課題6: エクスポート機能
**難易度:** ⭐️⭐️⭐️⭐️

**タスク:**
- [ ] 取引データをCSVでエクスポート
- [ ] 日付範囲を指定してエクスポート
- [ ] ダウンロードボタンを追加

**学習ポイント:**
- ファイル生成
- Blob API
- データフォーマット変換

**ヒント:**
```typescript
// CSVエクスポート関数
function exportToCSV(transactions: Transaction[]) {
  const headers = ['日付', 'ユーザー', '金額', '説明'];
  const rows = transactions.map(t => [
    t.date,
    t.userName,
    t.amount,
    t.description
  ]);
  
  const csv = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'transactions.csv';
  a.click();
}
```

### 上級課題

#### 課題7: 通知システム
**難易度:** ⭐️⭐️⭐️⭐️

**タスク:**
- [ ] 新しい取引が追加されたら通知
- [ ] 返済が完了したら通知
- [ ] 通知履歴を保存
- [ ] 未読/既読管理

**学習ポイント:**
- Socket.IOイベント
- 通知UI
- 状態管理
- データベース設計

#### 課題8: ダッシュボードのグラフ化
**難易度:** ⭐️⭐️⭐️⭐️⭐️

**タスク:**
- [ ] Chart.jsまたはRechartsを導入
- [ ] 月別支出グラフを作成
- [ ] カテゴリー別円グラフを作成
- [ ] ユーザー別棒グラフを作成

**学習ポイント:**
- グラフライブラリの使用
- データの集計と変換
- レスポンシブなグラフ

**ヒント:**
```bash
# Rechartsのインストール
npm install recharts

# 使用例
import { LineChart, Line, XAxis, YAxis } from 'recharts';

<LineChart data={monthlyData}>
  <XAxis dataKey="month" />
  <YAxis />
  <Line type="monotone" dataKey="amount" stroke="#8884d8" />
</LineChart>
```

#### 課題9: モバイルアプリ化
**難易度:** ⭐️⭐️⭐️⭐️⭐️

**タスク:**
- [ ] PWA（Progressive Web App）化
- [ ] オフライン対応
- [ ] プッシュ通知
- [ ] インストール可能にする

**学習ポイント:**
- Service Worker
- Cache API
- Web App Manifest
- Push API

---

## 📚 参考リソース

### 公式ドキュメント

#### JavaScript/TypeScript
- [TypeScript公式ドキュメント](https://www.typescriptlang.org/docs/)
- [MDN Web Docs](https://developer.mozilla.org/ja/)

#### React
- [React公式ドキュメント](https://ja.react.dev/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

#### バックエンド
- [Node.js公式ドキュメント](https://nodejs.org/docs/latest/api/)
- [Express.js公式ドキュメント](https://expressjs.com/)
- [Socket.IO公式ドキュメント](https://socket.io/docs/v4/)

#### データベース
- [PostgreSQL公式ドキュメント](https://www.postgresql.org/docs/)
- [SQLite公式ドキュメント](https://www.sqlite.org/docs.html)

#### バリデーション
- [Zod公式ドキュメント](https://zod.dev/)

#### テスト
- [Jest公式ドキュメント](https://jestjs.io/ja/)
- [Vitest公式ドキュメント](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

### 学習サイト

#### 日本語リソース
- [MDN Web Docs（日本語）](https://developer.mozilla.org/ja/)
- [JavaScript Primer](https://jsprimer.net/)
- [サバイバルTypeScript](https://typescriptbook.jp/)

#### 英語リソース（推奨）
- [freeCodeCamp](https://www.freecodecamp.org/)
- [The Odin Project](https://www.theodinproject.com/)
- [Full Stack Open](https://fullstackopen.com/en/)

### YouTube チャンネル

- [Traversy Media](https://www.youtube.com/@TraversyMedia) - Web開発全般
- [Web Dev Simplified](https://www.youtube.com/@WebDevSimplified) - React, JavaScript
- [Fireship](https://www.youtube.com/@Fireship) - 短くてわかりやすい解説

### コミュニティ

- [Stack Overflow](https://stackoverflow.com/) - 質問・回答
- [GitHub Discussions](https://github.com/usa4040/roommate-tracker/discussions) - プロジェクト固有の質問
- [Discord - Reactiflux](https://www.reactiflux.com/) - React コミュニティ

---

## 🎓 学習のコツ

### 1. 小さく始める
- 一度に全てを理解しようとしない
- 1つのファイル、1つの機能に集中
- 理解したら次に進む

### 2. 手を動かす
- コードを読むだけでなく、実際に書く
- 小さな変更から始める
- エラーを恐れない

### 3. デバッグスキルを磨く
```typescript
// console.logを活用
console.log('データ:', data);

// ブラウザのDevToolsを使う
debugger; // この行で実行が止まる

// TypeScriptのエラーメッセージを読む
// エラーメッセージは最高の先生
```

### 4. テストを書く
- テストは理解を深める最良の方法
- 既存のテストを読んで学ぶ
- 新機能には必ずテストを書く

### 5. ドキュメントを読む
- 公式ドキュメントは最も信頼できる情報源
- わからないことはまず公式ドキュメントを確認
- サンプルコードを試す

### 6. コミュニティを活用
- わからないことは質問する
- 他の人のコードを読む
- コードレビューを受ける

### 7. 定期的に復習
- 学んだことを定期的に見返す
- 自分の言葉でまとめる
- 誰かに説明してみる

---

## 📝 学習記録テンプレート

学習の進捗を記録することをお勧めします：

```markdown
## 学習記録 - YYYY/MM/DD

### 今日学んだこと
- 

### 理解できたこと
- 

### まだ理解できていないこと
- 

### 次回やること
- 

### メモ
- 
```

---

## 🎯 次のステップ

1. **このガイドを読む** - 全体像を把握
2. **環境をセットアップ** - プロジェクトを動かす
3. **レベルに合わせた学習パスを選ぶ** - 初級/中級/上級
4. **小さな課題から始める** - 成功体験を積む
5. **定期的に振り返る** - 学習記録をつける

---

## 💬 質問・サポート

わからないことがあれば、以下の方法で質問できます：

1. **GitHub Issues** - バグ報告や機能リクエスト
2. **GitHub Discussions** - 一般的な質問や議論
3. **コードレビュー** - Pull Requestでフィードバックを受ける

---

## 🎉 最後に

プログラミング学習は長い旅です。焦らず、楽しみながら学んでください！

**重要なのは:**
- ✅ 毎日少しずつ進むこと
- ✅ エラーから学ぶこと
- ✅ 楽しむこと

頑張ってください！🚀
