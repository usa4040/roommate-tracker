# API ドキュメント

このドキュメントは、ルームメイト支払い管理アプリのRESTful APIの仕様を説明します。

## ベースURL

```
開発環境: http://localhost:3001/api
本番環境: https://your-backend-url.com/api
```

## 認証

現在、このAPIは認証を必要としません。将来的にJWT認証を追加する予定です。

---

## エンドポイント一覧

### ユーザー管理

#### GET /users
全ユーザーを取得します。

**レスポンス**
```json
{
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "太郎",
      "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=太郎"
    }
  ]
}
```

#### POST /users
新しいユーザーを作成します。

**リクエストボディ**
```json
{
  "name": "太郎"
}
```

**バリデーション**
- `name`: 必須、1-50文字、前後の空白は自動トリミング

**レスポンス**
```json
{
  "message": "success",
  "data": {
    "id": 1,
    "name": "太郎",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=太郎"
  },
  "id": 1
}
```

#### PUT /users/:id
ユーザー情報を更新します。

**パラメータ**
- `id`: ユーザーID (数値)

**リクエストボディ**
```json
{
  "name": "次郎"
}
```

**レスポンス**
```json
{
  "message": "success",
  "data": {
    "id": 1,
    "name": "次郎",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=次郎"
  },
  "changes": 1
}
```

**エラーレスポンス**
- `404`: ユーザーが見つからない場合

#### DELETE /users/:id
ユーザーを削除します。

**パラメータ**
- `id`: ユーザーID (数値)

**レスポンス**
```json
{
  "message": "deleted",
  "changes": 1
}
```

---

### 経費管理

#### GET /transactions
全経費を取得します。

**レスポンス**
```json
{
  "message": "success",
  "data": [
    {
      "id": 1,
      "payer_id": 1,
      "payer_name": "太郎",
      "amount": 1000,
      "description": "食材",
      "date": "2024-01-01"
    }
  ]
}
```

#### POST /transactions
新しい経費を記録します。

**リクエストボディ**
```json
{
  "payer_id": 1,
  "amount": 1000,
  "description": "食材",
  "date": "2024-01-01"
}
```

**バリデーション**
- `payer_id`: 必須、正の整数
- `amount`: 必須、0.01-10000000の範囲
- `description`: 必須、1-200文字
- `date`: 必須、YYYY-MM-DD形式

**レスポンス**
```json
{
  "message": "success",
  "data": {
    "id": 1,
    "payer_id": 1,
    "amount": 1000,
    "description": "食材",
    "date": "2024-01-01"
  },
  "id": 1
}
```

**Socket.IO イベント**
- `data-updated`: `{ type: 'transaction-added', data: {...} }`

#### PUT /transactions/:id
経費を更新します。

**パラメータ**
- `id`: 経費ID (数値)

**リクエストボディ**
```json
{
  "payer_id": 1,
  "amount": 1500,
  "description": "食材（更新）",
  "date": "2024-01-02"
}
```

**レスポンス**
```json
{
  "message": "success",
  "data": {
    "id": 1,
    "payer_id": 1,
    "amount": 1500,
    "description": "食材（更新）",
    "date": "2024-01-02"
  },
  "changes": 1
}
```

**エラーレスポンス**
- `404`: 経費が見つからない場合

**Socket.IO イベント**
- `data-updated`: `{ type: 'transaction-updated', data: {...} }`

#### DELETE /transactions/:id
経費を削除します。

**パラメータ**
- `id`: 経費ID (数値)

**レスポンス**
```json
{
  "message": "deleted",
  "changes": 1
}
```

**Socket.IO イベント**
- `data-updated`: `{ type: 'transaction-deleted', id: 1 }`

---

### 返済管理

#### GET /payments
全返済を取得します。

**レスポンス**
```json
{
  "message": "success",
  "data": [
    {
      "id": 1,
      "from_user_id": 1,
      "to_user_id": 2,
      "from_user_name": "太郎",
      "to_user_name": "次郎",
      "amount": 500,
      "description": "家賃の返済",
      "date": "2024-01-01"
    }
  ]
}
```

#### POST /payments
新しい返済を記録します。

**リクエストボディ**
```json
{
  "from_user_id": 1,
  "to_user_id": 2,
  "amount": 500,
  "description": "家賃の返済",
  "date": "2024-01-01"
}
```

**バリデーション**
- `from_user_id`: 必須、正の整数
- `to_user_id`: 必須、正の整数、from_user_idと異なる必要がある
- `amount`: 必須、0.01-10000000の範囲
- `description`: オプション、最大200文字
- `date`: 必須、YYYY-MM-DD形式

**レスポンス**
```json
{
  "message": "success",
  "data": {
    "id": 1,
    "from_user_id": 1,
    "to_user_id": 2,
    "amount": 500,
    "description": "家賃の返済",
    "date": "2024-01-01"
  },
  "id": 1
}
```

**Socket.IO イベント**
- `data-updated`: `{ type: 'payment-added', data: {...} }`

#### PUT /payments/:id
返済を更新します。

**パラメータ**
- `id`: 返済ID (数値)

**リクエストボディ**
```json
{
  "from_user_id": 1,
  "to_user_id": 2,
  "amount": 600,
  "description": "家賃の返済（更新）",
  "date": "2024-01-02"
}
```

**レスポンス**
```json
{
  "message": "success",
  "data": {
    "id": 1,
    "from_user_id": 1,
    "to_user_id": 2,
    "amount": 600,
    "description": "家賃の返済（更新）",
    "date": "2024-01-02"
  },
  "changes": 1
}
```

**エラーレスポンス**
- `404`: 返済が見つからない場合

**Socket.IO イベント**
- `data-updated`: `{ type: 'payment-updated', data: {...} }`

#### DELETE /payments/:id
返済を削除します。

**パラメータ**
- `id`: 返済ID (数値)

**レスポンス**
```json
{
  "message": "deleted",
  "changes": 1
}
```

**Socket.IO イベント**
- `data-updated`: `{ type: 'payment-deleted', id: 1 }`

---

### 収支管理

#### GET /balance
各ユーザーの収支を取得します。

**レスポンス**
```json
{
  "message": "success",
  "data": [
    {
      "user_id": 1,
      "user_name": "太郎",
      "balance": -500
    },
    {
      "user_id": 2,
      "user_name": "次郎",
      "balance": 500
    }
  ]
}
```

**計算ロジック**
- 経費を支払った場合: プラス
- 返済を受け取った場合: プラス
- 返済を支払った場合: マイナス
- 各ユーザーの平均負担額を超えた分: プラス
- 各ユーザーの平均負担額に満たない分: マイナス

---

## エラーレスポンス

### バリデーションエラー (400)
```json
{
  "error": "バリデーションエラー",
  "details": [
    {
      "path": ["amount"],
      "message": "金額は0より大きい必要があります"
    }
  ]
}
```

### リソースが見つからない (404)
```json
{
  "error": "Transaction not found"
}
```

### サーバーエラー (500)
```json
{
  "error": "Internal server error"
}
```

---

## Socket.IO イベント

### 接続
```javascript
const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('Connected to server');
});
```

### データ更新通知
```javascript
socket.on('data-updated', (data) => {
  console.log('Data updated:', data);
  // data.type: 'transaction-added' | 'transaction-updated' | 'transaction-deleted' | 
  //            'payment-added' | 'payment-updated' | 'payment-deleted' |
  //            'user-added' | 'user-updated' | 'user-deleted'
});
```

---

## レート制限

現在、レート制限は実装されていません。将来的に追加する予定です。

---

## バージョニング

現在、APIバージョニングは実装されていません。全てのエンドポイントは `/api` 配下にあります。

---

## CORS

開発環境では全てのオリジンを許可しています。本番環境では、環境変数 `CLIENT_URL` で指定されたオリジンのみを許可します。

---

## データベーススキーマ

### users
| カラム | 型 | 制約 |
|--------|-----|------|
| id | INTEGER | PRIMARY KEY |
| name | TEXT | NOT NULL |
| avatar | TEXT | |

### transactions
| カラム | 型 | 制約 |
|--------|-----|------|
| id | INTEGER | PRIMARY KEY |
| payer_id | INTEGER | FOREIGN KEY (users.id) |
| amount | REAL | NOT NULL |
| description | TEXT | NOT NULL |
| date | TEXT | NOT NULL |

### payments
| カラム | 型 | 制約 |
|--------|-----|------|
| id | INTEGER | PRIMARY KEY |
| from_user_id | INTEGER | FOREIGN KEY (users.id) |
| to_user_id | INTEGER | FOREIGN KEY (users.id) |
| amount | REAL | NOT NULL |
| description | TEXT | |
| date | TEXT | NOT NULL |

---

## 使用例

### cURL

```bash
# ユーザーを作成
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"太郎"}'

# 経費を記録
curl -X POST http://localhost:3001/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"payer_id":1,"amount":1000,"description":"食材","date":"2024-01-01"}'

# 経費を更新
curl -X PUT http://localhost:3001/api/transactions/1 \
  -H "Content-Type: application/json" \
  -d '{"payer_id":1,"amount":1500,"description":"食材（更新）","date":"2024-01-02"}'
```

### JavaScript (Fetch API)

```javascript
// ユーザーを作成
const response = await fetch('http://localhost:3001/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: '太郎' })
});
const data = await response.json();

// 経費を更新
const updateResponse = await fetch('http://localhost:3001/api/transactions/1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    payer_id: 1,
    amount: 1500,
    description: '食材（更新）',
    date: '2024-01-02'
  })
});
const updateData = await updateResponse.json();
```
