interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  data: {
    userId: number;
    email: string;
  };
  accessToken: string;
  refreshToken: string;
  message?: string;
}

interface AuthServiceInterface {
  login(data: LoginRequest): Promise<AuthResponse>;
  register(data: RegisterRequest): Promise<AuthResponse>;
  refreshTokens(): Promise<boolean>;
  setTokens(accessToken: string, refreshToken: string | null): void;
  clearTokens(): void;
  getAccessToken(): string | null;
  getRefreshToken(): string | null;
}

class AuthService implements AuthServiceInterface {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  setTokens(accessToken: string, refreshToken: string | null): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken ?? '');
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  private async makeRequest<T>(
    url: string,
    method: 'POST' | 'GET',
    body?: object
  ): Promise<T> {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Request failed');
    }

    return response.json();
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const result = await this.makeRequest<AuthResponse>(
      'http://localhost:4000/auth/login',
      'POST',
      data
    );

    if (result.success) {
      this.setTokens(result.accessToken, result.refreshToken);
      return result;
    }

    throw new Error('Login failed');
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const result = await this.makeRequest<AuthResponse>(
      'http://localhost:4000/auth/register',
      'POST',
      data
    );

    if (result.success) {
      this.setTokens(result.accessToken, result.refreshToken);
      return result;
    }

    throw new Error('Registration failed');
  }

  async refreshTokens(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token available');

      const result = await this.makeRequest<AuthResponse>(
        'http://localhost:4000/auth/refresh',
        'POST',
        { refreshToken }
      );

      if (result.success) {
        this.setTokens(result.accessToken, result.refreshToken);
        return true;
      }

      return false;
    } catch (error) {
      this.clearTokens();
      return false;
    }
  }
}

export const authService = new AuthService();