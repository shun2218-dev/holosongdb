# 🎵 HoloSong DB - ホロライブ楽曲データベース

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.16-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?logo=postgresql)](https://neon.tech/)
[![PWA](https://img.shields.io/badge/PWA-Ready-purple)](https://web.dev/progressive-web-apps/)
[![Playwright](https://img.shields.io/badge/E2E-Playwright-green?logo=playwright)](https://playwright.dev/)

ホロライブプロダクションのオリジナル楽曲・歌ってみた動画を検索・管理できる非公式ファンサイトです。

## ✨ 主な機能

### 🔍 楽曲検索・閲覧
- **高速検索**: タイトル、タレント名、楽曲タイプでの絞り込み検索
- **詳細情報**: 再生回数、いいね数、作詞・作曲者情報
- **ソート機能**: 再生回数、リリース日、いいね数での並び替え
- **レスポンシブデザイン**: PC・スマートフォン・タブレット対応

### 📱 PWA対応
- **オフライン閲覧**: Service Workerによるキャッシュ機能
- **ホーム画面追加**: ネイティブアプリのような体験
- **オフライン状態表示**: ネットワーク状況の可視化
- **プッシュ通知対応**: 新楽曲追加時の通知（予定）

### 🛠️ 管理機能
- **楽曲管理**: CRUD操作、YouTube API連携による自動データ取得
- **タレント管理**: プロフィール情報、登録者数の自動更新
- **分析ダッシュボード**: 楽曲統計、トレンド分析
- **アクティビティログ**: 管理者操作の追跡

### 🔐 認証・セキュリティ
- **JWT認証**: セッション管理とセキュアな認証
- **ロールベース権限**: 管理者レベルでの権限制御
- **bcrypt暗号化**: パスワードの安全な保存

## 🚀 技術スタック

### フロントエンド
- **Next.js 14.2** - App Router、Server Components
- **React 19** - 最新のReact機能
- **TypeScript** - 型安全な開発
- **Tailwind CSS v4** - モダンなスタイリング
- **shadcn/ui** - 高品質なUIコンポーネント
- **Radix UI** - アクセシブルなプリミティブ

### バックエンド
- **Next.js API Routes** - サーバーサイドAPI
- **Prisma ORM** - 型安全なデータベース操作
- **PostgreSQL (Neon)** - クラウドデータベース
- **YouTube Data API v3** - 動画情報の自動取得

### 開発・テスト
- **Jest** - ユニットテスト
- **Playwright** - E2Eテスト
- **Storybook** - コンポーネント開発
- **ESLint/Prettier** - コード品質管理

### インフラ・デプロイ
- **Vercel** - ホスティング・デプロイ
- **Neon Database** - PostgreSQLクラウド
- **GitHub Actions** - CI/CD（予定）

## 🎯 工夫した点

### 🔧 技術的な工夫

#### 1. **オフライン対応の実装**
```typescript
// Service Workerによる戦略的キャッシュ
- 静的リソース: Cache First戦略
- API レスポンス: Network First戦略
- オフライン時の適切なフォールバック表示
```

#### 2. **パフォーマンス最適化**
- **Server Components**: 初期レンダリングの高速化
- **Suspense境界**: 段階的なローディング
- **データベースインデックス**: 検索クエリの最適化
- **画像最適化**: Next.js Image コンポーネント活用

#### 3. **型安全性の徹底**
```typescript
// Prismaスキーマからの型生成
// Zodによるバリデーション
// TypeScript strict mode
```

#### 4. **アクセシビリティ対応**
- **ARIA属性**: スクリーンリーダー対応
- **キーボードナビゲーション**: 完全対応
- **カラーコントラスト**: WCAG準拠
- **セマンティックHTML**: 適切な要素使用

### 🎨 UX/UI の工夫

#### 1. **直感的な検索体験**
- リアルタイム検索結果更新
- 検索履歴の保存
- 高度な絞り込みオプション

#### 2. **レスポンシブデザイン**
- モバイルファースト設計
- タッチフレンドリーなインターフェース
- 画面サイズに応じた最適なレイアウト

#### 3. **ダークモード対応**
- システム設定の自動検出
- 手動切り替え機能
- 全コンポーネントでの一貫した対応

## 📊 データベース設計

```sql
-- 主要テーブル構造
Talents (タレント情報)
├── 基本情報 (名前、支部、世代)
├── YouTube情報 (チャンネルID、登録者数)
└── 楽曲リレーション

Songs (楽曲情報)
├── 基本情報 (タイトル、タイプ、リリース日)
├── YouTube統計 (再生回数、いいね数)
├── クレジット情報 (作詞・作曲者)
└── メタデータ (タグ、言語)

Admins (管理者)
├── 認証情報 (ユーザー名、パスワード)
├── 権限管理 (ロール、アクティブ状態)
└── セッション管理
```

## 🧪 テスト戦略

### ユニットテスト (Jest)
- コンポーネントの動作確認
- ユーティリティ関数のテスト
- API エンドポイントのテスト

### E2Eテスト (Playwright)
- ユーザーフローの自動テスト
- クロスブラウザ対応確認
- アクセシビリティテスト
- パフォーマンステスト

### ビジュアルテスト (Storybook)
- コンポーネントの視覚的確認
- 各状態での表示テスト
- デザインシステムの一貫性確認

## 🚀 セットアップ

### 前提条件
- Node.js 18.0以上
- pnpm (推奨) または npm
- PostgreSQL データベース

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/your-username/hololive-song-db.git
cd hololive-song-db

# 依存関係のインストール
pnpm install

# 環境変数の設定
cp .env.example .env.local
# .env.local を編集して必要な環境変数を設定

# データベースのセットアップ
pnpm db:push
pnpm db:generate

# 開発サーバーの起動
pnpm dev
```

### 環境変数

```env
# データベース
DATABASE_URL="postgresql://..."
POSTGRES_URL="postgresql://..."

# YouTube API
YOUTUBE_API_KEY="your_youtube_api_key"

# 認証
JWT_SECRET="your_jwt_secret"

# その他
CRON_SECRET="your_cron_secret"
```

## 📝 使用方法

### 一般ユーザー
1. **楽曲検索**: トップページで楽曲を検索
2. **詳細表示**: 楽曲カードをクリックして詳細情報を確認
3. **PWAインストール**: ブラウザの「ホーム画面に追加」でアプリ化

### 管理者
1. **ログイン**: `/admin/login` でログイン
2. **楽曲管理**: 楽曲の追加・編集・削除
3. **統計確認**: ダッシュボードで分析データを確認

## 🤝 コントリビューション

プルリクエストやイシューの報告を歓迎します！

### 開発フロー
1. フォークしてブランチを作成
2. 変更を実装
3. テストを実行: `pnpm test`
4. E2Eテストを実行: `pnpm test:e2e`
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## ⚠️ 免責事項

このサイトは非公式のファンサイトです。ホロライブプロダクション公式とは一切関係ありません。
楽曲の著作権は各権利者に帰属します。

## 🔗 関連リンク

- [ホロライブプロダクション公式](https://www.hololive.tv/)
- [YouTube Data API](https://developers.google.com/youtube/v3)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

---

**Made with ❤️ for Hololive fans**
