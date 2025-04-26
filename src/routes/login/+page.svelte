<script>
	import { goto } from '$app/navigation';
	import api from '$lib/api';

	let email = '';
	let password = '';

	async function login() {
		if (email == '' || password == '') {
			alert('All fields must be filled!');
			goto('/login');
		} else {
			await api
				.post('/login', { email, password })
				.then((response) => {
					if (response.status !== 200) {
						throw new Error('Login falied!');
					}
					alert('Logged in succesfully');
					goto('/home');
				})
				.then((data) => console.log(data))
				.catch((error) => console.error(error));
		}
	}
</script>

<a href="/signup" class="btn">Sign up</a>
<h2>Login</h2>
<input type="text" bind:value={email} placeholder="Email" />
<input type="password" bind:value={password} placeholder="Password" />
<input type="submit" on:click={login} />
