interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
}

export const authService = {
  async login(loginData: LoginData): Promise<AuthResponse> {
    try {
      const response = await fetch('http://localhost:4000/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginData.email.trim(),
          password: loginData.password.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const result = await response.json();

      if (result.success) {
        localStorage.setItem('token', result.token);
        return result;
      }

      throw new Error('Login unsuccessful');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async register(registerData: LoginData): Promise<AuthResponse> {
    try {
      const response = await fetch('http://localhost:4000/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registerData.email.trim(),
          password: registerData.password.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const result = await response.json();

      if (result.success) {
        localStorage.setItem('token', result.token);
        return result;
      }

      throw new Error('Registration unsuccessful');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
};