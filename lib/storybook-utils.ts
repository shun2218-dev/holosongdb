// Storybook関連のユーティリティ関数

export function getStorybookUrl(): string {
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:6006"
  }

  // 本番環境では静的ビルドされたStorybookを使用
  return "/storybook-static"
}

export function isStorybookAvailable(): boolean {
  // 開発環境では常に利用可能とみなす
  if (process.env.NODE_ENV === "development") {
    return true
  }

  // 本番環境では静的ファイルの存在をチェック（簡易版）
  // 実際の実装では、ファイルシステムチェックやヘルスチェックを行う
  return true
}

export interface StorybookConfig {
  url: string
  available: boolean
  environment: "development" | "production"
}

export function getStorybookConfig(): StorybookConfig {
  return {
    url: getStorybookUrl(),
    available: isStorybookAvailable(),
    environment: process.env.NODE_ENV === "development" ? "development" : "production",
  }
}
