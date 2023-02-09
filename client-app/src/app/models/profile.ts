import { User } from "./user";

export interface Profile {
    displayName: string;
    username: string;
    bio?: string;
    followersCount: number;
    followingCount: number;
    following: boolean;
    image?: string;
    photos? : Photo[];
}

export class Profile implements Profile {
    constructor(user: User){
        this.displayName = user.displayName;
        this.username = user.username;
        this.image = user.image;
    }
}

export interface Photo {
    id: string;
    url: string;
    isMain: boolean;
}