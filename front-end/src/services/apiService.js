function postDataToBackend(url, data, isJson = false) {
	let fetchOptions = {
		method: "POST",
		headers: {
			// 'X-CSRFToken': getCSRFToken(), if needed
			"Content-Type": "application/json; charset=utf-8",
		},
	};

	if (isJson) {
		// Data is JSON, set Content-Type header and stringify the data
		fetchOptions.body = JSON.stringify(data);
	} else {
		// Data is FormData, let the browser set the Content-Type header
		fetchOptions.body = data;
	}

	return fetch(url, fetchOptions)
		.then((response) => {
			if (!response.ok) {
				throw response.status;
			}
			return response.json();
		})
		.catch((error) => {
			if (error instanceof Response) {
				return error.json();
			}
			throw error;
		});
}

export { postDataToBackend };
