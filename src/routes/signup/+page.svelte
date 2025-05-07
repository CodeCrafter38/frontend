<script>
	import { goto } from '$app/navigation';
	import api from '$lib/api';

	let username = '';
	let email = '';
	let password = '';
	let role = '';

	async function signup() {
		if (username == '' || email == '' || password == '' || role == '') {
			alert('Minden mezőt kötelező kitölteni!');
			goto('/signup');
		} else {
			await api
				.post('/signup', { username, email, password, role })
				.then((response) => {
					if (response.status !== 200) {
						throw new Error('Sikertelen regisztráció!');
					}
					alert('Felhasználó létrehozva');
					goto('/login');
				})
				.then((data) => console.log(data))
				.catch((error) => console.error(error));
		}
	}
</script>

<a href="/login" class="btn">Bejelentkezés</a>
<h2>Regisztráció</h2>
<input type="text" bind:value={username} placeholder="Felhasználónév" />
<input type="text" bind:value={email} placeholder="Email cím" />
<input type="password" bind:value={password} placeholder="Jelszó" />
<input type="text" bind:value={role} placeholder="Szerepkör" />
<br />
<input class="btn" type="submit" value="Regisztrálok" onclick={signup} />
