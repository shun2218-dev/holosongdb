import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { NotificationSettings } from "@/components/notification-settings"
import { jest } from "@jest/globals"

// Mock service worker registration
Object.defineProperty(window, "navigator", {
  value: {
    serviceWorker: {
      register: jest.fn().mockResolvedValue({
        pushManager: {
          subscribe: jest.fn().mockResolvedValue({
            endpoint: "https://fcm.googleapis.com/fcm/send/test",
            getKey: jest.fn().mockReturnValue(new Uint8Array([1, 2, 3])),
          }),
          getSubscription: jest.fn().mockResolvedValue(null),
        },
      }),
    },
  },
  writable: true,
})

// Mock Notification API
Object.defineProperty(window, "Notification", {
  value: {
    permission: "default",
    requestPermission: jest.fn().mockResolvedValue("granted"),
  },
  writable: true,
})

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe("NotificationSettings Component", () => {
  beforeEach(() => {
    mockFetch.mockClear()
    ;(window.Notification.requestPermission as jest.Mock).mockClear()
  })

  it("should render notification settings", () => {
    render(<NotificationSettings />)

    expect(screen.getByText("通知設定")).toBeInTheDocument()
    expect(screen.getByText("プッシュ通知を有効にする")).toBeInTheDocument()
  })

  it("should enable notifications", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "登録しました" }),
    } as Response)

    render(<NotificationSettings />)

    const enableButton = screen.getByText("通知を有効にする")
    fireEvent.click(enableButton)

    await waitFor(() => {
      expect(window.Notification.requestPermission).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/push/subscribe",
        expect.objectContaining({
          method: "POST",
        }),
      )
    })
  })

  it("should handle permission denied", async () => {
    ;(window.Notification.requestPermission as jest.Mock).mockResolvedValueOnce("denied")

    render(<NotificationSettings />)

    const enableButton = screen.getByText("通知を有効にする")
    fireEvent.click(enableButton)

    await waitFor(() => {
      expect(screen.getByText(/通知が拒否されています/)).toBeInTheDocument()
    })
  })

  it("should disable notifications", async () => {
    // Mock existing subscription
    const mockSubscription = {
      endpoint: "https://fcm.googleapis.com/fcm/send/test",
      unsubscribe: jest.fn().mockResolvedValue(true),
    }

    const mockServiceWorker = {
      pushManager: {
        getSubscription: jest.fn().mockResolvedValue(mockSubscription),
      },
    }
    ;(navigator.serviceWorker.register as jest.Mock).mockResolvedValueOnce(mockServiceWorker)

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "無効にしました" }),
    } as Response)

    render(<NotificationSettings />)

    await waitFor(() => {
      const disableButton = screen.getByText("通知を無効にする")
      fireEvent.click(disableButton)
    })

    await waitFor(() => {
      expect(mockSubscription.unsubscribe).toHaveBeenCalled()
    })
  })
})
