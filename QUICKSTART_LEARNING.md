# 🚀 クイックスタート学習ガイド

このガイドは、**今日から**プログラミング学習を始めるための実践的なステップバイステップガイドです。

---

## 📅 1日目: 環境構築とプロジェクト理解

### ステップ1: プロジェクトを起動する（30分）

#### バックエンドを起動
```bash
# ターミナル1を開く
cd /Users/home/project/ああ/roommate-tracker/server
npm install
npm run dev
```

✅ **確認:** `Server running on port 3001` と表示されればOK

#### フロントエンドを起動
```bash
# ターミナル2を開く（新しいターミナルウィンドウ）
cd /Users/home/project/ああ/roommate-tracker/client
npm install
npm run dev
```

✅ **確認:** `Local: http://localhost:5174` と表示されればOK

#### ブラウザで確認
1. ブラウザで `http://localhost:5174` を開く
2. アプリが表示されることを確認

---

### ステップ2: アプリの機能を試す（30分）

#### やってみること:
- [ ] ユーザーを追加する
- [ ] 取引を追加する
- [ ] 返済を記録する
- [ ] 収支サマリーを確認する
- [ ] 取引を編集する
- [ ] 取引を削除する

💡 **メモを取る:** 各機能がどう動くか、気づいたことをメモしましょう

---

### ステップ3: コードを読む（60分）

#### 読むべきファイル（この順番で）:

1. **`README.md`** (10分)
   - プロジェクトの全体像
   - 技術スタック
   - 機能一覧

2. **`client/src/main.tsx`** (10分)
   ```typescript
   // アプリのエントリーポイント
   // ここからすべてが始まる
   ```

3. **`client/src/App.tsx`** (15分)
   ```typescript
   // メインのアプリコンポーネント
   // ルーティングと全体構造
   ```

4. **`client/src/components/Layout.tsx`** (15分)
   ```typescript
   // 最もシンプルなコンポーネント
   // Reactの基本を学ぶのに最適
   ```

5. **`server/server.ts`** (10分)
   ```typescript
   // バックエンドのエントリーポイント
   // APIエンドポイントの定義
   ```

#### 読み方のコツ:
- わからない部分は飛ばしてOK
- コメントを読む
- 関数名から何をしているか推測する
- 気になる用語をメモする

---

## 📅 2-3日目: TypeScriptの基礎

### ステップ1: 型定義を理解する（60分）

#### `server/types.ts` を開く

```typescript
// このファイルを読んで、以下を理解する:

// 1. インターフェースとは？
interface User {
  id: number;        // ユーザーID（数値）
  name: string;      // ユーザー名（文字列）
  email: string;     // メールアドレス（文字列）
}

// 2. 型の再利用
interface Transaction {
  id: number;
  userId: number;    // Userのidを参照
  amount: number;
  description: string;
}
```

#### 実践課題:
```typescript
// client/src/types/index.ts に新しい型を追加してみる

// 例: カテゴリー型
export interface Category {
  id: number;
  name: string;
  color: string;  // 例: "#FF5733"
  icon: string;   // 例: "🍔"
}
```

---

### ステップ2: Zodバリデーションを理解する（60分）

#### `server/schemas.ts` を開く

```typescript
import { z } from 'zod';

// スキーマ = データの形を定義するもの
const userSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  email: z.string().email("有効なメールアドレスを入力してください"),
});

// 使い方
const result = userSchema.safeParse(data);
if (result.success) {
  console.log('バリデーション成功!', result.data);
} else {
  console.log('エラー:', result.error);
}
```

#### 実践課題:
新しいバリデーションルールを追加してみる

```typescript
// server/schemas.ts に追加

// 取引の金額は1円以上100万円以下
export const transactionSchema = z.object({
  amount: z.number()
    .min(1, "金額は1円以上である必要があります")
    .max(1000000, "金額は100万円以下である必要があります"),
  description: z.string()
    .min(1, "説明は必須です")
    .max(100, "説明は100文字以内にしてください"),
});
```

---

## 📅 4-7日目: Reactの基礎

### ステップ1: コンポーネントを理解する（1日目）

#### `client/src/components/Layout.tsx` を詳しく読む

```typescript
// Reactコンポーネントの基本構造

import { ReactNode } from 'react';

// 1. propsの型定義
interface LayoutProps {
  children: ReactNode;  // 子要素
}

// 2. 関数コンポーネント
export function Layout({ children }: LayoutProps) {
  // 3. JSXを返す
  return (
    <div className="layout">
      <header>
        <h1>ルームメイト支払い管理</h1>
      </header>
      <main>
        {children}  {/* 子要素を表示 */}
      </main>
    </div>
  );
}
```

#### 実践課題: Footerコンポーネントを作る

1. **ファイルを作成:** `client/src/components/Footer.tsx`

```typescript
export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer style={{
      textAlign: 'center',
      padding: '20px',
      marginTop: '40px',
      borderTop: '1px solid #eee'
    }}>
      <p>© {currentYear} Roommate Tracker. All rights reserved.</p>
    </footer>
  );
}
```

2. **Layoutに組み込む:** `client/src/components/Layout.tsx`

```typescript
import { Footer } from './Footer';

export function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <header>...</header>
      <main>{children}</main>
      <Footer />  {/* 追加 */}
    </div>
  );
}
```

3. **確認:** ブラウザでフッターが表示されることを確認

---

### ステップ2: useState を理解する（2日目）

#### `client/src/components/Dashboard.tsx` を読む

```typescript
import { useState } from 'react';

function Dashboard() {
  // useState = 状態を管理するフック
  // [現在の値, 値を更新する関数] = useState(初期値)
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // 状態を更新する
  const addTransaction = (newTransaction: Transaction) => {
    setTransactions([...transactions, newTransaction]);
  };
  
  return (
    <div>
      <p>取引数: {transactions.length}</p>
    </div>
  );
}
```

#### 実践課題: カウンターコンポーネントを作る

1. **ファイルを作成:** `client/src/components/Counter.tsx`

```typescript
import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  
  const increment = () => {
    setCount(count + 1);
  };
  
  const decrement = () => {
    setCount(count - 1);
  };
  
  const reset = () => {
    setCount(0);
  };
  
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>カウンター</h2>
      <p style={{ fontSize: '48px', fontWeight: 'bold' }}>{count}</p>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button onClick={decrement}>-1</button>
        <button onClick={reset}>リセット</button>
        <button onClick={increment}>+1</button>
      </div>
    </div>
  );
}
```

2. **Dashboardに追加して確認**

---

### ステップ3: useEffect を理解する（3日目）

#### useEffectの基本

```typescript
import { useState, useEffect } from 'react';

function Dashboard() {
  const [data, setData] = useState([]);
  
  // useEffect = 副作用を扱うフック
  useEffect(() => {
    // コンポーネントがマウントされた時に実行
    console.log('コンポーネントがマウントされました');
    
    // データを取得
    fetchData();
    
    // クリーンアップ関数（オプション）
    return () => {
      console.log('コンポーネントがアンマウントされます');
    };
  }, []); // 空の配列 = 初回のみ実行
  
  // 依存配列に値を入れると、その値が変わった時に実行
  useEffect(() => {
    console.log('dataが変更されました:', data);
  }, [data]);
}
```

#### 実践課題: タイマーコンポーネントを作る

```typescript
import { useState, useEffect } from 'react';

export function Timer() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  
  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    
    // クリーンアップ: インターバルを停止
    return () => clearInterval(interval);
  }, [isRunning]);
  
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>タイマー</h2>
      <p style={{ fontSize: '48px' }}>{seconds}秒</p>
      <button onClick={() => setIsRunning(!isRunning)}>
        {isRunning ? '停止' : '開始'}
      </button>
      <button onClick={() => setSeconds(0)}>リセット</button>
    </div>
  );
}
```

---

### ステップ4: フォーム処理を理解する（4日目）

#### `client/src/components/AddTransaction.tsx` を読む

```typescript
function AddTransaction() {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // デフォルトの送信を防ぐ
    
    // バリデーション
    if (!amount || !description) {
      alert('すべての項目を入力してください');
      return;
    }
    
    // データを送信
    submitTransaction({ amount: Number(amount), description });
    
    // フォームをリセット
    setAmount('');
    setDescription('');
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="金額"
      />
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="説明"
      />
      <button type="submit">追加</button>
    </form>
  );
}
```

#### 実践課題: お問い合わせフォームを作る

```typescript
import { useState } from 'react';

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('送信データ:', { name, email, message });
    alert('送信しました!');
    
    // リセット
    setName('');
    setEmail('');
    setMessage('');
  };
  
  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h2>お問い合わせ</h2>
      
      <div style={{ marginBottom: '15px' }}>
        <label>お名前</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ width: '100%', padding: '8px' }}
        />
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label>メールアドレス</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: '8px' }}
        />
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label>メッセージ</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={5}
          style={{ width: '100%', padding: '8px' }}
        />
      </div>
      
      <button type="submit">送信</button>
    </form>
  );
}
```

---

## 📅 8-14日目: バックエンドの基礎

### ステップ1: Express.jsの基本を理解する（1-2日目）

#### `server/server.ts` を読む

```typescript
import express from 'express';

const app = express();

// ミドルウェア: すべてのリクエストに適用される処理
app.use(express.json()); // JSONをパースする

// GET エンドポイント: データを取得
app.get('/api/users', (req, res) => {
  const users = db.prepare('SELECT * FROM users').all();
  res.json(users);
});

// POST エンドポイント: データを作成
app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  
  // データベースに保存
  const result = db.prepare(
    'INSERT INTO users (name, email) VALUES (?, ?)'
  ).run(name, email);
  
  res.status(201).json({ id: result.lastInsertRowid, name, email });
});

// PUT エンドポイント: データを更新
app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  
  db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?')
    .run(name, email, id);
  
  res.json({ message: '更新しました' });
});

// DELETE エンドポイント: データを削除
app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  
  res.json({ message: '削除しました' });
});

// サーバーを起動
app.listen(3001, () => {
  console.log('Server running on port 3001');
});
```

#### 実践課題: 新しいエンドポイントを追加

```typescript
// server/server.ts に追加

// ユーザーの取引履歴を取得
app.get('/api/users/:id/transactions', (req, res) => {
  const { id } = req.params;
  
  const transactions = db.prepare(`
    SELECT t.*, u.name as userName
    FROM transactions t
    JOIN users u ON t.userId = u.id
    WHERE t.userId = ?
    ORDER BY t.date DESC
  `).all(id);
  
  res.json(transactions);
});

// 統計情報を取得
app.get('/api/stats', (req, res) => {
  const totalTransactions = db.prepare(
    'SELECT COUNT(*) as count FROM transactions'
  ).get();
  
  const totalAmount = db.prepare(
    'SELECT SUM(amount) as total FROM transactions'
  ).get();
  
  res.json({
    totalTransactions: totalTransactions.count,
    totalAmount: totalAmount.total || 0,
  });
});
```

**確認方法:**
```bash
# ブラウザまたはcurlで確認
curl http://localhost:3001/api/stats
```

---

### ステップ2: データベース操作を理解する（3-4日目）

#### SQLの基本

```sql
-- データを取得
SELECT * FROM users;
SELECT * FROM users WHERE id = 1;
SELECT name, email FROM users;

-- データを挿入
INSERT INTO users (name, email) VALUES ('太郎', 'taro@example.com');

-- データを更新
UPDATE users SET name = '次郎' WHERE id = 1;

-- データを削除
DELETE FROM users WHERE id = 1;

-- 結合（JOIN）
SELECT t.*, u.name
FROM transactions t
JOIN users u ON t.userId = u.id;

-- 集計
SELECT userId, SUM(amount) as total
FROM transactions
GROUP BY userId;
```

#### 実践課題: カテゴリーテーブルを追加

1. **マイグレーションファイルを作成:** `server/migrations.ts` に追加

```typescript
export function createCategoriesTable(db: Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      icon TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // デフォルトカテゴリーを追加
  const insert = db.prepare(`
    INSERT INTO categories (name, color, icon) VALUES (?, ?, ?)
  `);
  
  insert.run('食費', '#FF6B6B', '🍔');
  insert.run('交通費', '#4ECDC4', '🚗');
  insert.run('娯楽', '#45B7D1', '🎮');
  insert.run('その他', '#95A5A6', '📦');
}
```

2. **APIエンドポイントを追加:** `server/server.ts`

```typescript
// カテゴリー一覧を取得
app.get('/api/categories', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories').all();
  res.json(categories);
});

// カテゴリーを追加
app.post('/api/categories', (req, res) => {
  const { name, color, icon } = req.body;
  
  const result = db.prepare(
    'INSERT INTO categories (name, color, icon) VALUES (?, ?, ?)'
  ).run(name, color, icon);
  
  res.status(201).json({
    id: result.lastInsertRowid,
    name,
    color,
    icon,
  });
});
```

---

## 📅 15-21日目: 統合とテスト

### ステップ1: フロントエンドとバックエンドを接続（1-3日目）

#### API呼び出しの基本

```typescript
// client/src/api/categories.ts を作成

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export async function getCategories() {
  const response = await fetch(`${API_URL}/categories`);
  if (!response.ok) {
    throw new Error('カテゴリーの取得に失敗しました');
  }
  return response.json();
}

export async function createCategory(data: { name: string; color: string; icon: string }) {
  const response = await fetch(`${API_URL}/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('カテゴリーの作成に失敗しました');
  }
  
  return response.json();
}
```

#### コンポーネントで使用

```typescript
// client/src/components/CategoryList.tsx

import { useState, useEffect } from 'react';
import { getCategories } from '../api/categories';

export function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCategories();
  }, []);
  
  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>エラー: {error}</p>;
  
  return (
    <div>
      <h2>カテゴリー一覧</h2>
      <ul>
        {categories.map(cat => (
          <li key={cat.id}>
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
            <span style={{ color: cat.color }}>●</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

### ステップ2: テストを書く（4-7日目）

#### コンポーネントのテスト

```typescript
// client/src/__tests__/Counter.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { Counter } from '../components/Counter';

describe('Counter', () => {
  test('初期値は0である', () => {
    render(<Counter />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });
  
  test('+1ボタンをクリックするとカウントが増える', () => {
    render(<Counter />);
    
    const incrementButton = screen.getByText('+1');
    fireEvent.click(incrementButton);
    
    expect(screen.getByText('1')).toBeInTheDocument();
  });
  
  test('リセットボタンをクリックすると0に戻る', () => {
    render(<Counter />);
    
    // カウントを増やす
    const incrementButton = screen.getByText('+1');
    fireEvent.click(incrementButton);
    fireEvent.click(incrementButton);
    
    // リセット
    const resetButton = screen.getByText('リセット');
    fireEvent.click(resetButton);
    
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
```

#### APIのテスト

```typescript
// server/__tests__/categories.test.ts

import request from 'supertest';
import { app } from '../server';

describe('Categories API', () => {
  test('GET /api/categories - カテゴリー一覧を取得できる', async () => {
    const response = await request(app).get('/api/categories');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
  
  test('POST /api/categories - カテゴリーを作成できる', async () => {
    const newCategory = {
      name: 'テストカテゴリー',
      color: '#FF0000',
      icon: '🎯',
    };
    
    const response = await request(app)
      .post('/api/categories')
      .send(newCategory);
    
    expect(response.status).toBe(201);
    expect(response.body.name).toBe(newCategory.name);
  });
});
```

**テストの実行:**
```bash
# フロントエンドテスト
cd client
npm test

# バックエンドテスト
cd server
npm test
```

---

## 🎯 チェックリスト: 3週間の学習目標

### Week 1: 基礎理解
- [ ] プロジェクトを起動できる
- [ ] アプリの全機能を試した
- [ ] TypeScriptの基本的な型を理解した
- [ ] Zodバリデーションを理解した
- [ ] Reactコンポーネントの基本を理解した

### Week 2: React実践
- [ ] useStateを使ったコンポーネントを作成できる
- [ ] useEffectを使ったデータフェッチができる
- [ ] フォーム処理ができる
- [ ] 簡単なコンポーネントを自分で作成できる

### Week 3: バックエンドと統合
- [ ] Express.jsの基本を理解した
- [ ] SQLの基本クエリを書ける
- [ ] APIエンドポイントを追加できる
- [ ] フロントエンドからAPIを呼び出せる
- [ ] 簡単なテストを書ける

---

## 💡 学習のヒント

### デバッグ方法

```typescript
// 1. console.logを使う
console.log('データ:', data);
console.log('エラー:', error);

// 2. ブラウザのDevToolsを使う
// F12キーを押して開発者ツールを開く
// Consoleタブでエラーを確認
// NetworkタブでAPI通信を確認

// 3. debuggerを使う
function myFunction() {
  debugger; // ここで実行が止まる
  const result = someCalculation();
  return result;
}
```

### エラーの読み方

```
TypeError: Cannot read property 'name' of undefined
         ↑           ↑                ↑
      エラーの種類   何を読もうとした  何が問題か

→ 「undefinedのnameプロパティを読もうとした」
→ データがまだ読み込まれていない可能性
```

### よくあるエラーと解決方法

1. **`npm install` が失敗する**
   ```bash
   # node_modulesを削除して再インストール
   rm -rf node_modules
   npm install
   ```

2. **ポートが使用中**
   ```bash
   # プロセスを終了
   lsof -ti:3001 | xargs kill
   ```

3. **型エラー**
   ```typescript
   // 型を明示的に指定
   const data: User[] = [];
   ```

---

## 🎉 次のステップ

3週間の学習を終えたら:

1. **`LEARNING_GUIDE.md`の中級課題に挑戦**
2. **自分のアイデアを実装してみる**
3. **GitHub Issuesで質問する**
4. **コミュニティに参加する**

頑張ってください!🚀
