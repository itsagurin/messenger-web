$(".info-item .btn").click(function(){
    $(".container").toggleClass("log-in");
});
$(".container-form .btn").click(function(){
    $(".container").addClass("active");
});

document.querySelector('.login-button').addEventListener('click', async () => {
    try {
        const email = document.querySelector('input[name="email-login"]').value;
        const password = document.querySelector('input[name="password-login"]').value;

        const response = await fetch('http://localhost:4000/auth/login', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email.trim(),
                password: password.trim()
            }),
        });

        // Check HTTP status code, not just response body
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
        }

        const result = await response.json();
        if (result.success) {
            window.location.href = '../test.html';
        } else {
            console.error('Login unsuccessful:', result);
        }
    } catch (error) {
        console.error('Login error:', error.message);
        // Optionally show error to user
        alert(error.message);
    }
});

document.querySelector('.signup-button').addEventListener('click', async () => {
    try {
        const email = document.querySelector('input[name="email-signup"]').value;
        const password = document.querySelector('input[name="password-signup"]').value;

        console.log('Email:', email);
        console.log('Password:', password);

        if (!email || !password) {
            throw new Error('Email и пароль обязательны');
        }

        const response = await fetch('http://localhost:4000/auth/register', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email.trim(),
                password: password.trim()
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Registration failed');
        }

        const result = await response.json();
        if (result.success) {
            window.location.href = '../test.html';
        } else {
            console.error('Registration unsuccessful:', result);
        }
    } catch (error) {
        console.error('Registration error:', error.message);
        alert(error.message);
    }
});