interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
  success: boolean;
  message?: string;
  token?: string;
  refreshToken?: string;
}

interface AuthServiceInterface {
  getRefreshToken(): string | null;
  getAccessToken(): string | null;

  setTokens(accessToken: string, refreshToken: string | undefined): void;
  clearTokens(): void;
  refreshTokens(): Promise<boolean>;
  makeAuthenticatedRequest(url: string, options?: RequestInit): Promise<Response>;
}

class AuthService implements AuthServiceInterface {
  private accessToken: string | null = null;
  private refreshToken: string | null = null; // allow refreshToken to be undefined


  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  setTokens(accessToken: string, refreshToken: string | null | undefined): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken ?? null;
    localStorage.setItem('refreshToken', this.refreshToken ?? '');
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('refreshToken');
  }

  async refreshTokens(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      const response = await fetch('http://localhost:4000/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();
      if (data.success) {
        this.setTokens(data.accessToken, data.refreshToken);
        return true;
      }
      return false;
    } catch (error) {
      this.clearTokens();
      return false;
    }
  }

  async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    try {
      const headers = {
        ...options.headers,
        'Authorization': `Bearer ${this.accessToken}`,
      };

      const response = await fetch(url, { ...options, headers });

      if (response.status === 401) {
        const refreshed = await this.refreshTokens();
        if (refreshed) {
          headers['Authorization'] = `Bearer ${this.accessToken}`;
          return fetch(url, { ...options, headers });
        } else {
          throw new Error('Authentication failed');
        }
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  async login(loginData: LoginData): Promise<AuthResponse> {
    try {
      console.log('Login Request:', {
        url: 'http://localhost:4000/auth/login',
        method: 'POST',
        body: {
          email: loginData.email.trim(),
          password: loginData.password.trim()
        }
      });

      const response = await fetch('http://localhost:4000/auth/login', {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: loginData.email.trim(),
          password: loginData.password.trim()
        }),
      });

      console.log('Login Response Status:', response.status);
      console.log('Login Response Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error Response Text:', errorText);

        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || 'Login failed');
        } catch {
          throw new Error(`HTTP error! status: ${response.status}, text: ${errorText}`);
        }
      }

      const result = await response.json();
      console.log('Login Result:', result);

      if (result.success) {
        // Here we check for the presence of refreshToken before saving it
        if (result.refreshToken) {
          localStorage.setItem('token', result.token || ''); // if token is optional
          authService.setTokens(result.accessToken, result.refreshToken); // save tokens
          return result;
        } else {
          throw new Error('Refresh token is missing');
        }
      }

      throw new Error('Login unsuccessful');
    } catch (error) {
      console.error('Full Login Error:', error);
      throw error;
    }
  }

  async register(registerData: LoginData): Promise<AuthResponse> {
    try {
      console.log('Register Request:', {
        url: 'http://localhost:4000/auth/register',
        method: 'POST',
        body: {
          email: registerData.email.trim(),
          password: registerData.password.trim()
        }
      });

      const response = await fetch('http://localhost:4000/auth/register', {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: registerData.email.trim(),
          password: registerData.password.trim()
        }),
      });

      console.log('Register Response Status:', response.status);
      console.log('Register Response Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error Response Text:', errorText);

        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || 'Registration failed');
        } catch {
          throw new Error(`HTTP error! status: ${response.status}, text: ${errorText}`);
        }
      }

      const result = await response.json();
      console.log('Register Result:', result);

      if (result.success) {
        // Check for refreshToken before using it
        if (result.refreshToken) {
          localStorage.setItem('token', result.token || ''); // if token is optional
          authService.setTokens(result.accessToken, result.refreshToken); // save tokens
          return result;
        } else {
          throw new Error('Refresh token is missing');
        }
      }

      throw new Error('Registration unsuccessful');
    } catch (error) {
      console.error('Full Registration Error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();