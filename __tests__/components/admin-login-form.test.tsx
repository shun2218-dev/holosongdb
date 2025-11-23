import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { AdminLoginForm } from "@/components/admin-login-form"
import { useRouter } from "next/navigation"
import jest from "jest" // Declaring jest variable

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}))

global.fetch = jest.fn()

describe("AdminLoginForm", () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
  })

  it("should render login form", () => {
    render(<AdminLoginForm />)

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument()
  })

  it("should handle successful login", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    })

    render(<AdminLoginForm />)

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "admin" },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    })
    fireEvent.click(screen.getByRole("button", { name: /login/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/admin")
    })
  })

  it("should show error on failed login", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Invalid credentials" }),
    })

    render(<AdminLoginForm />)

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "wrong" },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrong" },
    })
    fireEvent.click(screen.getByRole("button", { name: /login/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })

  it("should validate required fields", async () => {
    render(<AdminLoginForm />)

    fireEvent.click(screen.getByRole("button", { name: /login/i }))

    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it("should disable submit button while loading", async () => {
    ;(global.fetch as jest.Mock).mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)))

    render(<AdminLoginForm />)

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "admin" },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    })

    const submitButton = screen.getByRole("button", { name: /login/i })
    fireEvent.click(submitButton)

    expect(submitButton).toBeDisabled()
  })
})
