export interface OptimizeImageOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  maxSizeMB?: number
}

export async function optimizeImage(file: File, options: OptimizeImageOptions = {}): Promise<File> {
  const { maxWidth = 800, maxHeight = 800, quality = 0.85, maxSizeMB = 1 } = options

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new window.Image()

      img.onload = () => {
        const canvas = document.createElement("canvas")
        let { width, height } = img

        // アスペクト比を維持しながらリサイズ
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.floor(width * ratio)
          height = Math.floor(height * ratio)
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Canvas context not available"))
          return
        }

        // 画像を描画
        ctx.drawImage(img, 0, 0, width, height)

        // Blobに変換
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to create blob"))
              return
            }

            // ファイルサイズチェック
            const sizeMB = blob.size / (1024 * 1024)
            if (sizeMB > maxSizeMB) {
              // さらに品質を下げて再試行
              const newQuality = quality * (maxSizeMB / sizeMB)
              canvas.toBlob(
                (retryBlob) => {
                  if (!retryBlob) {
                    reject(new Error("Failed to create blob on retry"))
                    return
                  }

                  const optimizedFile = new File([retryBlob], file.name, { type: "image/jpeg" })
                  resolve(optimizedFile)
                },
                "image/jpeg",
                Math.max(0.5, newQuality),
              )
            } else {
              const optimizedFile = new File([blob], file.name, { type: "image/jpeg" })
              resolve(optimizedFile)
            }
          },
          "image/jpeg",
          quality,
        )
      }

      img.onerror = () => {
        reject(new Error("Failed to load image"))
      }

      img.src = e.target?.result as string
    }

    reader.onerror = () => {
      reject(new Error("Failed to read file"))
    }

    reader.readAsDataURL(file)
  })
}

export async function generateBlurDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new window.Image()

      img.onload = () => {
        // 非常に小さいサイズでぼかしプレースホルダーを生成
        const canvas = document.createElement("canvas")
        const blurWidth = 10
        const blurHeight = Math.floor((img.height / img.width) * blurWidth)

        canvas.width = blurWidth
        canvas.height = blurHeight

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Canvas context not available"))
          return
        }

        // 画像を小さく描画
        ctx.drawImage(img, 0, 0, blurWidth, blurHeight)

        // Base64データURLとして取得
        const blurDataURL = canvas.toDataURL("image/jpeg", 0.1)
        resolve(blurDataURL)
      }

      img.onerror = () => {
        reject(new Error("Failed to load image"))
      }

      img.src = e.target?.result as string
    }

    reader.onerror = () => {
      reject(new Error("Failed to read file"))
    }

    reader.readAsDataURL(file)
  })
}
