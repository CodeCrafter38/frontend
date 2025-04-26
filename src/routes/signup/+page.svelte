<script>
	import { goto } from '$app/navigation';
	import api from '$lib/api';

	let username = '';
	let email = '';
	let password = '';
	let role = '';

	async function signup() {
		if (username == '' || email == '' || password == '' || role == '') {
			alert('All fields must be filled!');
			goto('/signup');
		} else {
			await api
				.post('/signup', { username, email, password, role })
				.then((response) => {
					if (response.status !== 200) {
						throw new Error('Signup failed!');
					}
					alert('User created succesfully');
					goto('/login');
				})
				.then((data) => console.log(data))
				.catch((error) => console.error(error));
		}
	}
</script>

<a href="/login" class="btn">Login</a>
<h2>Sign up</h2>
<input type="text" bind:value={username} placeholder="Username" />
<input type="text" bind:value={email} placeholder="Email" />
<input type="password" bind:value={password} placeholder="Password" />
<input type="text" bind:value={role} placeholder="Role" />
<input type="submit" value="Register" on:click={signup} />
