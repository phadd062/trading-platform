import { AuthenticationError, isString } from "utils/helpers";

const REFRESH_TOKEN_STORAGE_KEY = "tokenRefresh";
const TOKEN_STORAGE_KEY = "token";

const LOGIN_TOKEN_URL = "/token/login";
const REFRESH_TOKEN_URL = "/token/refresh";

interface ResponseData {
	data?: any;
	clientError?: any;
	responseOK?: any;
}

export default class HttpClient {
	#navigateFunc: (url: string, arg: object) => void;

	constructor(navigateFunc: (url: string) => void) {
		this.#navigateFunc = navigateFunc;
	}

	queryFetch = async (url: string) => {
		const isAuthenticated = await this.isAuthenticated();
		if (!isAuthenticated) {
			this.#handleAuthFailure();
			throw new Error("Authentication failed");
		}
		const authHeaders = await this.#getAuthHeaders();
		const headers = { ...authHeaders, "Content-Type": "application/json" };

		const response = await fetch(url, {
			headers: headers,
			method: "get",
		});
		if (!response.ok) throw new Error("Network response was not ok");
		return response.json();
	};
	rawGet = async (url: string) => {
		return this.#request(url, {
			method: "GET",
			raw: true,
		}) as Promise<Response>;
	};
	rawExport = async (url: string, body: any) => {
		const isAuthenticated = await this.isAuthenticated();
		if (!isAuthenticated) {
			this.#handleAuthFailure();
			throw new Error("Authentication failed");
		}
		const authHeaders = await this.#getAuthHeaders();
		const headers = { ...authHeaders, "Content-Type": "application/json" };

		const response = await fetch(url, {
			headers: headers,
			method: "POST",
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			const errorData = await response.text();
			throw new Error("Network response was not ok");
		}

		return response;
	};
	get = async (url: string) => {
		return this.#request(url, { method: "GET" }) as ResponseData;
	};
	post = async (url: string, body: any) => {
		return this.#request(url, { method: "POST" }, body) as ResponseData;
	};
	put = async (url: string, body: any) => {
		return this.#request(url, { method: "PUT" }, body) as ResponseData;
	};
	delete = async (url: string) => {
		// API delete endpoints are not uniform (returning 200 and 204) so we force clients to interact with the raw response
		return this.#request(url, {
			method: "DELETE",
			raw: true,
		}) as Promise<Response>;
	};
	login = async (username: string, password: string): Promise<number> => {
		const response = await fetch(LOGIN_TOKEN_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username,
				password,
			}),
		});
		if (response.ok) {
			const data = await response.json();
			localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, data.refresh);
			localStorage.setItem(TOKEN_STORAGE_KEY, data.access);
		}
		return response.status;
	};
	logout = async () => {
		const isAuthenticated = await this.isAuthenticated();
		if (isAuthenticated) {
			const authHeaders = await this.#getAuthHeaders();
			// fetch(LOGOUT_URL, {
			// 	method: "Post",
			// 	body: JSON.stringify({
			// 		tokenRefresh: this.#getRefreshTokenFromLocalStorage(),
			// 	}),
			// 	headers: { ...authHeaders, "Content-Type": "application/json" },
			// });
		}
		this.#clearTokens();
		this.navigateToLogin();
	};
	navigateToLogin = () => {
		this.#navigateFunc("/login", { replace: true });
	};
	isAuthenticated = async (): Promise<Boolean> => {
		if (this.#hasValidToken()) return true;
		else if (!this.#hasValidRefreshToken()) return false;
		const wroteNewToken = await this.#writeNewTokenFromRefresh();
		return wroteNewToken;
	};

	#request = async (
		url: string,
		options: { raw?: boolean; method?: "PUT" | "GET" | "DELETE" | "POST" } = {},
		body: any = null,
	) => {
		const isAuthenticated = await this.isAuthenticated();
		if (!isAuthenticated) {
			this.#handleAuthFailure();
			return {
				data: undefined,
				clientError: new AuthenticationError("Not authenticated"),
			};
		}

		const authHeaders = await this.#getAuthHeaders();
		let bodyArg: any;
		if (body) bodyArg = isString(body) ? body : JSON.stringify(body);
		try {
			const resp = await fetch(url, {
				headers: { ...authHeaders, "Content-Type": "application/json" },
				method: options.method || "get",
				body: bodyArg,
			});

			if (options.raw) return resp;
			const data = await resp.json();
			return { data, clientError: undefined, responseOK: resp.ok };
		} catch (e) {
			this.#handleFetchFailure(e);
			return { data: undefined, clientError: e };
		}
	};
	#handleFetchFailure = (err: any) => console.error(err);
	#handleAuthFailure = () => {
		this.#clearTokens();
		this.navigateToLogin();
	};
	#getAuthHeaders = async () => {
		const token = await this.#getToken();
		return { Authorization: `Bearer ${token}` };
	};
	#getToken = async () => {
		if (this.#hasValidToken()) return this.#getTokenFromLocalStorage();
		if (this.#hasValidRefreshToken()) {
			const gotNewToken = await this.#writeNewTokenFromRefresh();
			if (gotNewToken) return this.#getTokenFromLocalStorage();
		}
		throw new AuthenticationError("No valid token");
	};
	#writeNewTokenFromRefresh = async (): Promise<Boolean> => {
		const refreshToken = this.#getRefreshTokenFromLocalStorage();
		const resp = await fetch(REFRESH_TOKEN_URL, {
			method: "POST",
			body: JSON.stringify({ refresh: refreshToken }),
			headers: {
				"Content-Type": "application/json",
			},
		});
		if (!resp.ok) {
			this.#clearTokens();
			return false;
		}
		const json = await resp.json();
		localStorage.setItem(TOKEN_STORAGE_KEY, json.access);
		return true;
	};
	#hasValidToken = () => {
		const token = this.#getTokenFromLocalStorage();
		if (!token) return false;
		return !this.#isTokenExpired(token);
	};
	#hasValidRefreshToken = () => {
		const refreshToken = this.#getRefreshTokenFromLocalStorage();
		if (!refreshToken) return false;
		return !this.#isTokenExpired(refreshToken);
	};
	#isTokenExpired = (token: string) => {
		const decodedToken = this.#parseJwt(token);
		const CURRENTDATE = Date.now() + 10000;
		const DECODEDTIME = 1000;
		return decodedToken.exp * DECODEDTIME < CURRENTDATE;
	};
	#getRefreshTokenFromLocalStorage = () => {
		return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
	};
	#getTokenFromLocalStorage = () => localStorage.getItem(TOKEN_STORAGE_KEY);
	#clearTokens = () => {
		localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
		localStorage.removeItem(TOKEN_STORAGE_KEY);
	};
	#parseJwt = (token: string) => {
		const base64Url = token.split(".")[1];
		const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
		const jsonPayload = decodeURIComponent(
			window
				.atob(base64)
				.split("")
				.map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
				.join(""),
		);
		return JSON.parse(jsonPayload);
	};
}
