# テストドキュメント

このドキュメントは、ルームメイト支払い管理アプリのテスト戦略とテストの実行方法を説明します。

## 📊 テスト概要

### テスト統計

- **総テスト数**: 77 tests
- **バックエンド**: 36 tests
- **フロントエンド**: 41 tests
- **全体カバレッジ**: 61.81%

### テストフレームワーク

| 環境 | フレームワーク | 用途 |
|------|--------------|------|
| バックエンド | Jest | ユニットテスト・統合テスト |
| バックエンド | Supertest | API統合テスト |
| フロントエンド | Vitest | ユニットテスト・コンポーネントテスト |
| フロントエンド | React Testing Library | コンポーネントテスト |

---

## 🧪 バックエンドテスト

### テスト構成

```
server/__tests__/
├── schemas.test.ts      # スキーマバリデーションテスト (18 tests)
└── api.test.ts          # API統合テスト (18 tests)
```

### スキーマバリデーションテスト

**テスト対象**: `server/schemas.ts`

**テストケース** (18 tests):
- `userInputSchema` (4 tests)
  - ✅ 有効なユーザー入力を受け入れる
  - ✅ 空の名前を拒否する
  - ✅ 50文字を超える名前を拒否する
  - ✅ 名前の前後の空白をトリミングする

- `transactionInputSchema` (7 tests)
  - ✅ 有効な経費入力を受け入れる
  - ✅ 負の金額を拒否する
  - ✅ ゼロの金額を拒否する
  - ✅ 1000万円を超える金額を拒否する
  - ✅ 空の内容を拒否する
  - ✅ 200文字を超える内容を拒否する
  - ✅ 無効な日付形式を拒否する

- `paymentInputSchema` (4 tests)
  - ✅ 有効な返済入力を受け入れる
  - ✅ 同じユーザー間の返済を拒否する
  - ✅ 内容が空でも受け入れる
  - ✅ 内容がundefinedでも受け入れる

- `idParamSchema` (3 tests)
  - ✅ 有効な数値IDを受け入れる
  - ✅ 文字列IDを数値に変換する
  - ✅ 非数値IDを拒否する

### API統合テスト

**テスト対象**: `server/server.ts`

**テストケース** (18 tests):

#### ユーザー管理 (5 tests)
- ✅ GET /api/users - 全ユーザーを取得できる
- ✅ POST /api/users - 有効なユーザーを作成できる
- ✅ POST /api/users - 空の名前でユーザー作成を拒否する
- ✅ PUT /api/users/:id - ユーザー名を更新できる
- ✅ PUT /api/users/:id - 存在しないユーザーの更新で404を返す
- ✅ DELETE /api/users/:id - ユーザーを削除できる

#### 経費管理 (7 tests)
- ✅ POST /api/transactions - 有効な経費を作成できる
- ✅ POST /api/transactions - 負の金額で経費作成を拒否する
- ✅ GET /api/transactions - 全経費を取得できる
- ✅ DELETE /api/transactions/:id - 経費を削除できる
- ✅ PUT /api/transactions/:id - 経費を更新できる
- ✅ PUT /api/transactions/:id - 存在しない経費の更新で404を返す
- ✅ PUT /api/transactions/:id - 無効なデータで経費更新を拒否する

#### 返済管理 (6 tests)
- ✅ POST /api/payments - 有効な返済を作成できる
- ✅ POST /api/payments - 同じユーザー間の返済を拒否する
- ✅ PUT /api/payments/:id - 返済を更新できる
- ✅ PUT /api/payments/:id - 存在しない返済の更新で404を返す
- ✅ PUT /api/payments/:id - 同じユーザー間の返済更新を拒否する

### テストの実行

```bash
cd server

# 全テストを実行
npm test

# カバレッジレポートを生成
npm run test:coverage

# ウォッチモードで実行
npm test -- --watch

# 特定のテストファイルを実行
npm test -- schemas.test.ts
```

---

## ⚛️ フロントエンドテスト

### テスト構成

```
client/src/__tests__/
├── schemas.test.ts              # スキーマバリデーションテスト (8 tests)
├── Layout.test.tsx              # Layoutコンポーネントテスト (3 tests)
├── Dashboard.test.tsx           # Dashboardコンポーネントテスト (6 tests)
├── UserManagement.test.tsx      # UserManagementコンポーネントテスト (9 tests)
├── AddTransaction.test.tsx      # AddTransactionコンポーネントテスト (3 tests)
└── TransactionList.test.tsx     # TransactionListコンポーネントテスト (12 tests)
```

### スキーマバリデーションテスト

**テスト対象**: `client/src/schemas.ts`

**テストケース** (8 tests):
- `userInputSchema` (2 tests)
- `transactionInputSchema` (3 tests)
- `paymentInputSchema` (3 tests)

### コンポーネントテスト

#### Layout.tsx (3 tests)
- ✅ ヘッダーが表示される
- ✅ タイトルが表示される
- ✅ 子要素が表示される

**カバレッジ**: 100% ✅

#### Dashboard.tsx (6 tests)
- ✅ 収支サマリータイトルが表示される
- ✅ ユーザーの収支が表示される
- ✅ プラスの収支が緑色で表示される
- ✅ マイナスの収支が赤色で表示される
- ✅ ゼロの収支が表示される
- ✅ ユーザーがいない場合にメッセージが表示される

**カバレッジ**: 90.9% ✅

#### UserManagement.tsx (9 tests)
- ✅ ユーザー管理タイトルが表示される
- ✅ ユーザーリストが表示される
- ✅ ユーザー追加フォームが表示される
- ✅ 新しいユーザーを追加できる
- ✅ ユーザー名を編集できる
- ✅ 編集をキャンセルできる
- ✅ ユーザーを削除できる
- ✅ ユーザーがいない場合にメッセージが表示される
- ✅ アバターが表示される

**カバレッジ**: 71.79% ✅

#### AddTransaction.tsx (3 tests)
- ✅ 経費追加タブが表示される
- ✅ 返済タブが表示される
- ✅ 返済タブに切り替えられる

**カバレッジ**: 32.55% (改善の余地)

#### TransactionList.tsx (12 tests)
- ✅ 最近の取引タイトルが表示される
- ✅ 経費が正しく表示される
- ✅ 返済が正しく表示される
- ✅ 金額が表示される
- ✅ 取引がない場合にメッセージが表示される
- ✅ 編集ボタンが表示される
- ✅ 編集ボタンをクリックすると編集フォームが表示される
- ✅ 編集フォームで入力フィールドが表示される
- ✅ 編集フォームでキャンセルボタンをクリックすると編集モードが終了する
- ✅ 複数の取引が表示される
- ✅ 削除ボタンをクリックすると確認モーダルが表示される
- ✅ 削除確認モーダルでキャンセルをクリックするとモーダルが閉じる

**カバレッジ**: 66.66%

### テストの実行

```bash
cd client

# 全テストを実行
npm test

# カバレッジレポートを生成
npm run test:coverage

# UIモードで実行
npm run test:ui

# 特定のテストファイルを実行
npm test -- TransactionList.test.tsx
```

---

## 📈 カバレッジレポート

### 全体カバレッジ

| カテゴリ | カバレッジ | 評価 |
|---------|-----------|------|
| **全体** | 61.81% | 良好 |
| Statements | 61.81% | 良好 |
| Branches | 48.48% | 改善の余地 |
| Functions | 62.9% | 良好 |
| Lines | 62.89% | 良好 |

### コンポーネント別カバレッジ

| ファイル | Statements | Branches | Functions | Lines | 評価 |
|---------|-----------|----------|-----------|-------|------|
| schemas.ts | 100% | 100% | 100% | 100% | 完璧 ✅ |
| Layout.tsx | 100% | 100% | 100% | 100% | 完璧 ✅ |
| Dashboard.tsx | 90.9% | 60% | 100% | 100% | 優秀 ✅ |
| UserManagement.tsx | 71.79% | 55.55% | 76.92% | 75.67% | 良好 ✅ |
| TransactionList.tsx | 66.66% | 55.55% | 64.28% | 66.66% | 良好 |
| AddTransaction.tsx | 32.55% | 36% | 33.33% | 33.33% | 改善の余地 |

### カバレッジレポートの生成

```bash
# バックエンド
cd server
npm run test:coverage

# フロントエンド
cd client
npm run test:coverage

# HTMLレポートを生成（自動的に生成されます）
# server/coverage/lcov-report/index.html
# client/coverage/index.html
```

---

## 🎯 テスト戦略

### ユニットテスト

**目的**: 個別の関数やモジュールの動作を検証

**対象**:
- スキーマバリデーション
- ユーティリティ関数
- カスタムフック

**原則**:
- 1つの関数につき複数のテストケース
- 正常系と異常系の両方をテスト
- エッジケースをカバー

### 統合テスト

**目的**: 複数のモジュールの連携を検証

**対象**:
- APIエンドポイント
- データベース操作
- Socket.IO通信

**原則**:
- 実際のHTTPリクエストをシミュレート
- データベースの状態を検証
- エラーハンドリングをテスト

### コンポーネントテスト

**目的**: UIコンポーネントの動作を検証

**対象**:
- Reactコンポーネント
- ユーザーインタラクション
- 状態管理

**原則**:
- ユーザーの視点でテスト
- 実装の詳細に依存しない
- アクセシビリティを考慮

---

## 🚀 CI/CD統合

### GitHub Actions

テストは自動的にCI/CDパイプラインで実行されます：

```yaml
# .github/workflows/ci-cd.yml

jobs:
  backend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd server && npm ci
      - run: cd server && npm test

  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd client && npm ci
      - run: cd client && npm test -- --run
```

### テスト失敗時の対応

1. **ローカルでテストを実行**
   ```bash
   npm test
   ```

2. **失敗したテストを特定**
   ```bash
   npm test -- --reporter=verbose
   ```

3. **修正してコミット**
   ```bash
   git add .
   git commit -m "🐛 Fix failing tests"
   git push
   ```

---

## 📝 テストの書き方

### バックエンドテストの例

```typescript
// server/__tests__/api.test.ts

describe('PUT /api/transactions/:id', () => {
  it('経費を更新できる', async () => {
    // 1. テストデータを作成
    const createResponse = await request(app)
      .post('/api/transactions')
      .send({
        payer_id: 1,
        amount: 1000,
        description: 'テスト経費',
        date: '2024-01-01'
      });

    const transactionId = createResponse.body.data.id;

    // 2. 更新リクエストを送信
    const updatedData = {
      payer_id: 2,
      amount: 2000,
      description: '更新された経費',
      date: '2024-01-02'
    };

    const response = await request(app)
      .put(`/api/transactions/${transactionId}`)
      .send(updatedData);

    // 3. レスポンスを検証
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('success');
    expect(response.body.data.amount).toBe(updatedData.amount);
    expect(response.body.changes).toBe(1);
  });
});
```

### フロントエンドテストの例

```typescript
// client/src/__tests__/TransactionList.test.tsx

it('編集ボタンをクリックすると編集フォームが表示される', async () => {
  // 1. ユーザーイベントをセットアップ
  const user = userEvent.setup();

  // 2. コンポーネントをレンダリング
  const { container } = render(
    <TransactionList
      transactions={mockTransactions}
      payments={mockPayments}
      users={mockUsers}
      onDeleteTransaction={mockDeleteTransaction}
      onDeletePayment={mockDeletePayment}
      onUpdateTransaction={mockUpdateTransaction}
      onUpdatePayment={mockUpdatePayment}
    />
  );

  // 3. 編集ボタンを見つけてクリック
  const buttons = container.querySelectorAll('button');
  const editButton = Array.from(buttons).find(
    btn => btn.getAttribute('title') === '編集'
  );
  
  if (editButton) {
    await user.click(editButton);

    // 4. 編集フォームが表示されることを検証
    await waitFor(() => {
      expect(screen.getByText('保存')).toBeInTheDocument();
      expect(screen.getByText('キャンセル')).toBeInTheDocument();
    });
  }
});
```

---

## 🔍 テストのベストプラクティス

### DO ✅

- **明確なテスト名**: テストが何を検証しているか明確に
- **AAA パターン**: Arrange (準備) → Act (実行) → Assert (検証)
- **独立性**: 各テストは独立して実行可能に
- **モック**: 外部依存をモック化
- **エッジケース**: 境界値やエラーケースをテスト

### DON'T ❌

- **実装の詳細に依存**: 内部実装ではなく動作をテスト
- **複数の概念**: 1つのテストで1つの概念のみ検証
- **テスト間の依存**: テストの実行順序に依存しない
- **ハードコーディング**: マジックナンバーを避ける
- **過度なモック**: 必要最小限のモックに留める

---

## 📊 カバレッジ目標

### 現在の目標

- **全体**: 60%以上 ✅ (達成: 61.81%)
- **重要なコンポーネント**: 70%以上
- **ユーティリティ関数**: 90%以上

### 今後の目標

- **全体**: 80%以上
- **重要なコンポーネント**: 90%以上
- **ユーティリティ関数**: 100%

---

## 🛠️ トラブルシューティング

### テストが失敗する

1. **エラーメッセージを確認**
   ```bash
   npm test -- --reporter=verbose
   ```

2. **特定のテストのみ実行**
   ```bash
   npm test -- -t "テスト名"
   ```

3. **デバッグモード**
   ```bash
   node --inspect-brk node_modules/.bin/jest --runInBand
   ```

### カバレッジが低い

1. **カバレッジレポートを確認**
   ```bash
   npm run test:coverage
   open coverage/index.html
   ```

2. **未カバーの行を特定**
   - HTMLレポートで赤くハイライトされた行を確認

3. **テストを追加**
   - 未カバーのコードパスに対するテストを追加

---

## 📚 参考資料

- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)
