export const BASE_URL = "https://auth.nomoreparties.co";

const checkResponse = (response) => {
    if(response.ok) {
        return response.json()
    }
    return Promise.reject(`Ошибка: ${response.status}`);
}


export const register =  (email, password) => {
    return fetch(`${BASE_URL}/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    })
    .then(checkResponse)
}

export const authorize = (email, password) => {
    return fetch(`${BASE_URL}/signin`, {
        method:"POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({email, password})
    })
    .then(checkResponse)
};

export const checkToken = (jwt) => {
    return fetch(`${BASE_URL}/users/me`, {
        method:"GET",
        header: {
                "Accept":  "application/json",
                "Content-Type": "application/json",
                "Authorization" : `Bearer ${jwt}`
        }
    })
    .then((response) => checkResponse(response))
        .then((data) => data)
    }