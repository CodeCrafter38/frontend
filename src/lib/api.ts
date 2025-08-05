import axios from 'axios';

const backendPort = import.meta.env.VITE_EXPRESS_PORT;

const api = axios.create({
	baseURL: `http://localhost:${backendPort}/api`,
	withCredentials: true, // cookie-t is küldünk a request-tel együtt
	headers: {
		'Content-Type': 'application/json'
	}
});

export default api;
