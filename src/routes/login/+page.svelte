<script>
	import { goto } from '$app/navigation';
	import api from '$lib/api';

	let email = '';
	let password = '';

	async function login() {
		if (email == '' || password == '') {
			alert('Minden mezőt kötelező kitölteni!');
		} else {
			await api
				.post('/login', { email, password })
				.then((response) => {
					if (response.status !== 200) {
						throw new Error('Sikertelen bejelentkezés!');
					} else {
						alert('Sikeres bejelentkezés');
						goto('/home');
					}
				})
				.then((data) => console.log(data))
				.catch((error) => console.error(error));
		}
	}
</script>

<a href="/signup" class="btn">Regisztráció</a>
<h2>Bejelentkezés</h2>
<input type="text" bind:value={email} placeholder="Email cím" />
<input type="password" bind:value={password} placeholder="Jelszó" />
<br />
<input class="btn" type="submit" value="Bejelentkezek" on:click={login} />
