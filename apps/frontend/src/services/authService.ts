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
        localStorage.setItem('token', result.token);
        return result;
      }

      throw new Error('Login unsuccessful');
    } catch (error) {
      console.error('Full Login Error:', error);
      throw error;
    }
  },

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
        localStorage.setItem('token', result.token);
        return result;
      }

      throw new Error('Registration unsuccessful');
    } catch (error) {
      console.error('Full Registration Error:', error);
      throw error;
    }
  },
};