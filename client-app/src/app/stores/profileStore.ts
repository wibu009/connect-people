import { store } from './store';
import { makeAutoObservable, runInAction } from 'mobx';
import agent from '../api/agent';
import { Profile } from "../models/profile";
import { toast } from 'react-toastify';

export default class ProfileStore {
    profile: Profile | null = null;
    loadingProfile = false;
    uploading = false;
    loading = false;

    constructor() {
        makeAutoObservable(this);
    }

    get isCurrentUser() {
        if (store.userStore.user && this.profile) {
            return store.userStore.user.username === this.profile.username;
        }
        return false;
    }

    loadProfile = async (username: string) => {
        this.loadingProfile = true;
        try {
            const profile = await agent.Profiles.get(username);
            runInAction(() => {
                this.profile = profile;
                this.loadingProfile = false;
            })
        }
        catch (error) {
            console.log(error);
            runInAction(() => this.loadingProfile = false);
        }
    }

    uploadPhoto = async (file: Blob) => {
        this.uploading = true;
        try {
            const response = await agent.Profiles.uploadPhoto(file);
            const photo = response.data;
            runInAction(() => {
                if (this.profile) {
                    this.profile.photos?.push(photo);
                    if (photo.isMain && store.userStore.user) {
                        store.userStore.setImage(photo.url);
                        this.profile.image = photo.url;
                    }
                    toast.success('Photo uploaded', { theme: 'light' });
                }
                this.uploading = false;
            })
        }
        catch (error) {
            console.log(error);
            runInAction(() => {
                this.uploading = false;
            })
        }
    }

    setMainPhoto = async (photo: any) => {
        this.loading = true;
        try {
            await agent.Profiles.setMainPhoto(photo.id);
            store.userStore.setImage(photo.url);
            runInAction(() => {
                if (this.profile && this.profile.photos) {
                    this.profile.photos.find(a => a.isMain)!.isMain = false;
                    this.profile.photos.find(a => a.id === photo.id)!.isMain = true;
                    this.profile.image = photo.url;
                    this.loading = false;
                    toast.success('Photo set as main', {
                        theme: 'light'
                    });
                }
            })
        }
        catch (error) {
            console.log(error);
            runInAction(() => this.loading = false);
        }
    }

    deletePhoto = async (photo: any) => {
        this.loading = true;
        try {
            await agent.Profiles.deletePhoto(photo.id);
            runInAction(() => {
                if (this.profile && this.profile.photos) {
                    this.profile.photos = this.profile.photos.filter(a => a.id !== photo.id);
                    this.loading = false;
                    toast.success('Photo deleted', { theme: 'light' });
                }
            })
        }
        catch (error) {
            console.log(error);
            runInAction(() => this.loading = false);
        }
    }

    updateProfile = async (profile: Partial<Profile>) => {
        this.loading = true;
        try {
            await agent.Profiles.updateProfile(profile);
            runInAction(() => {
                if (profile.displayName && profile.displayName !==
                    store.userStore.user?.displayName) {
                    store.userStore.setDisplayName(profile.displayName);
                }
                this.profile = { ...this.profile, ...profile as Profile };
                this.loading = false;
                toast.success('Profile updated', { theme: 'light' });
            })
        } catch (error) {
            console.log(error);
            runInAction(() => this.loading = false);
        }
    }
}