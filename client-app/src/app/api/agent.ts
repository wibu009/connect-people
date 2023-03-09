import { Photo, Profile, UserActivity } from './../models/profile';
import { User, UserFormValues } from './../models/user';
import { Activity, ActivityFormValues } from './../models/activity';
import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from 'react-toastify';
import { router } from '../router/Routes';
import { store } from '../stores/store';
import { PaginatedResult } from '../models/pagination';

const sleep = (delay: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, delay);
    })
}

axios.defaults.baseURL = process.env.REACT_APP_API_URL;

const responseBody = <T>(response: AxiosResponse<T>) => response.data;

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
    if (process.env.NODE_ENV === 'development') await sleep(1000);
    // Get the pagination header
    const pagination = response.headers['pagination'];
    // If the pagination header exists
    if (pagination) {
        // Parse the pagination header
        response.data = new PaginatedResult(response.data, JSON.parse(pagination));
        // Return the response
        return response as AxiosResponse<PaginatedResult<any>>;
    }
    // Return the response
    return response;
}, (error: AxiosError) => {
    // Destructure the error response
    const { data, status, config } = error.response! as AxiosResponse;
    // Switch on the status
    switch (status) {
        case 400:
            // If the method is get and there is an id error
            if (config.method === 'get' && data.errors.hasOwnProperty('id')) {
                // Navigate to not found
                router.navigate('/not-found');
            }
            // If there are errors
            if (data.errors) {
                // Create an array to store the errors
                const modalStateErrors = [];
                // Loop over the errors
                for (const key in data.errors) {
                    // If there is a key
                    if (data.errors[key]) {
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
            toast.error('Unauthorized', { theme: 'light' });
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
    get: <T>(url: string) => axios.get<T>(url).then(responseBody),
    post: <T>(url: string, body: {}) => axios.post<T>(url, body).then(responseBody),
    put: <T>(url: string, body: {}) => axios.put<T>(url, body).then(responseBody),
    del: <T>(url: string) => axios.delete<T>(url).then(responseBody),
}

const Activities = {
    list: (params: URLSearchParams) => axios.get<PaginatedResult<Activity[]>>("/activities", { params: params }).then(responseBody),
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

const Profiles = {
    get: (username: string) => requests.get<Profile>(`/profiles/${username}`),
    uploadPhoto: (file: Blob) => {
        let formData = new FormData();
        formData.append('File', file);
        return axios.post<Photo>('/photos', formData, {
            headers: { 'Content-type': 'multipart/form-data' }
        })
    },
    setMainPhoto: (id: string) => requests.post(`/photos/${id}/setMain`, {}),
    deletePhoto: (id: string) => requests.del(`/photos/${id}`),
    updateProfile: (profile: Partial<Profile>) => requests.put(`/profiles`, profile),
    updateFollowing: (username: string) => requests.post(`/follow/${username}`, {}),
    listFollowings: (username: string, predicate: string) => requests.get<Profile[]>(`/follow/${username}?predicate=${predicate}`),
    listActivities: (username: string, predicate: string) => requests.get<UserActivity[]>(`/profiles/${username}/activities?predicate=${predicate}`)
}

const agent = {
    Activities,
    Account,
    Profiles
}

export default agent;