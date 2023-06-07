import { router } from './../router/Routes';
import { store } from './store';
import { makeAutoObservable, runInAction } from 'mobx';
import agent from '../api/agent';
import { User, UserFormValues } from './../models/user';
import { ChangePasswordFormValues } from '../models/changePassword';
import { toast } from 'react-toastify';

export default class UserStore {
    user: User | null = null
    fbLoading = false;
    refreshTokenTimeout: any;

    constructor() {
        makeAutoObservable(this)
    }

    get isLoggedIn() {
        return this.user;
    }

    login = async (creds: UserFormValues) => {
        try {
            const user = await agent.Account.login(creds);
            store.commonStore.setToken(user.token);
            this.startRefreshTokenTimer(user);
            runInAction(() => this.user = user);
            router.navigate('/activities');
            store.modalStore.closeModal();
        } catch (error) {
            throw error;
        }
    }

    register = async (creds: UserFormValues) => {
        try {
            await agent.Account.register(creds);
            router.navigate('/account/registerSuccess?email=' + creds.email);
            store.modalStore.closeModal();
        } catch (error: any) {
            if(error.response !== null) {
                throw error;
            }
            store.modalStore.closeModal();
        }
    }

    forgotPassword = async (email: string) => {
        await agent.Account.sendEmailResetPassword(email).then(() => {
            router.navigate('/account/forgotPasswordSuccess?email=' + email);
            store.modalStore.closeModal();
        }).catch((error) => {
            throw error;
        });
    }

    changePassword = async (creds: ChangePasswordFormValues) => {
        try {
            await agent.Account.changePassword(creds);
            toast.success("Password changed successfully", { autoClose: 2000, theme: "light" });
            router.navigate('/activities');
        } catch (error: any) {
            throw error;
        }
    }

    logout = async () => {
        this.stopRefreshTokenTimer();
        store.commonStore.setToken(null);
        this.user = null;
        store.resetStore();
        router.navigate('/');
    }

    getUser = async () => {
        try {
            const user = await agent.Account.current();
            store.commonStore.setToken(user.token);
            runInAction(() => this.user = user);
            this.startRefreshTokenTimer(user);
        } catch (error) {
            console.log(error);
        }
    }

    setImage = (image: string) => {
        if (this.user) this.user.image = image;
    }

    setDisplayName = (displayName: string) => {
        if (this.user) this.user.displayName = displayName;
    }

    facebookLogin = async (accessToken: string) => {
        try {
            this.fbLoading = true;
            const user = await agent.Account.fbLogin(accessToken);
            store.commonStore.setToken(user.token);
            this.startRefreshTokenTimer(user);
            runInAction(() => {
                this.user = user;
                this.fbLoading = false;
            });
            router.navigate('/activities');
            store.modalStore.closeModal();
        } catch (error) {
            runInAction(() => this.fbLoading = false);
            console.log(error);
        }
    }

    refreshToken = async () => {
        this.stopRefreshTokenTimer();
        try {
            const user = await agent.Account.refreshToken();
            runInAction(() => this.user = user);
            store.commonStore.setToken(user.token);
            this.startRefreshTokenTimer(user);
        } catch (error) {
            console.log(error);
        }
    }

    private startRefreshTokenTimer = (user: User) => {
        const jwtToken = JSON.parse(atob(user.token.split('.')[1]));
        const expires = new Date(jwtToken.exp * 1000);
        const timeout = expires.getTime() - Date.now() - (60 * 1000);
        this.refreshTokenTimeout = setTimeout(this.refreshToken, timeout);
    }

    private stopRefreshTokenTimer = () => {
        clearTimeout(this.refreshTokenTimeout);
    }
}