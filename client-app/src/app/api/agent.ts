import { User, UserFormValues } from './../models/user';
import { Activity, ActivityFormValues } from './../models/activity';
import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from 'react-toastify';
import { router } from '../router/Routes';
import { store } from '../stores/store';

const sleep = (delay: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, delay);
    })
}

axios.defaults.baseURL = "http://localhost:5000/api";

const responseBody = <T> (response: AxiosResponse<T>) => response.data;

// Define an interceptor that will be called before all outgoing requests.
axios.interceptors.request.use(config => {
    // Get the token from the store.
    const token = store.commonStore.token;
    // If the token exists and the request has a headers object, add the token to the Authorization header.
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
    // Return the updated configuration.
    return config;
})

// Add a response interceptor
axios.interceptors.response.use(async response => {
    // Sleep for 1 second
    await sleep(1000);
    // Return the response
    return response;
}, (error: AxiosError) => {
    // Destructure the error response
    const { data, status, config } = error.response! as AxiosResponse;
    // Switch on the status
    switch (status) {
        case 400:
            // If the method is get and there is an id error
            if(config.method === 'get' && data.errors.hasOwnProperty('id')) {
                // Navigate to not found
                router.navigate('/not-found');
            }
            // If there are errors
            if(data.errors) {
                // Create an array to store the errors
                const modalStateErrors = [];
                // Loop over the errors
                for(const key in data.errors) {
                    // If there is a key
                    if(data.errors[key]) {
                        // Add the error to the array
                        modalStateErrors.push(data.errors[key]);
                    }
                }
                // Throw all of the errors
                throw modalStateErrors.flat();
            } else {
                // Show a toast with the data
                toast.error(data);
            }
            break;
        // Repeat for each status
        case 401:
            toast.error('Unauthorized');
            break;
        case 403:
            toast.error('Forbidden');
            break;
        case 404:
            router.navigate('/not-found');
            break;
        case 500:
            store.commonStore.setServerError(data);
            router.navigate('/server-error');
            break;
    }
    // Reject the error
    return Promise.reject(error);
})

const requests = {
    get: <T> (url: string) => axios.get<T>(url).then(responseBody),
    post: <T> (url: string, body: {}) => axios.post<T>(url, body).then(responseBody),
    put: <T> (url: string, body: {}) => axios.put<T>(url, body).then(responseBody),
    del: <T> (url: string) => axios.delete<T>(url).then(responseBody),
}

const Activities = {
    list: () => requests.get<Activity[]>("/activities"),
    details: (id: string) => requests.get<Activity>(`/activities/${id}`),
    create: (activity: ActivityFormValues) => requests.post<void>('/activities', activity),
    update: (activity: ActivityFormValues) => requests.put<void>(`/activities/${activity.id}`, activity),
    delete: (id: string) => requests.del<void>(`/activities/${id}`),
    attend: (id: string) => requests.post<void>(`/activities/${id}/attend`, {}),
}

const Account = {
    current: () => requests.get<User>('/account'),
    login: (user: UserFormValues) => requests.post<User>('/account/login', user),
    register: (user: UserFormValues) => requests.post<User>('/account/register', user)

}

const agent = {
    Activities,
    Account
}

export default agent;