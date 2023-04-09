import { createContext, useContext } from "react";
import ActivityStore from "./activityStore";
import CommentStore from "./commentStore";
import CommonStore from "./commonStore";
import ModalStore from "./modalStore";
import ProfileStore from "./profileStore";
import UserStore from "./userStore";

interface Store {
    activityStore: ActivityStore;
    commonStore: CommonStore;
    userStore: UserStore;
    modalStore: ModalStore,
    profileStore: ProfileStore
    commentStore: CommentStore
    resetStore(): void;
}

export const store: Store = {
    activityStore: new ActivityStore(),
    commonStore: new CommonStore(),
    userStore: new UserStore(),
    modalStore: new ModalStore(),
    profileStore: new ProfileStore(),
    commentStore: new CommentStore(),
    resetStore(): void {
        store.activityStore.activityRegistry.clear();
        store.commonStore.setToken(null);
        store.modalStore.closeModal();
        store.userStore.user = null;
        store.profileStore.profile = null;
        store.commentStore.clearComments();

    }
}

export const StoreContext = createContext(store);

export function useStore() {
    return useContext(StoreContext);
}

export function refreshStore() {
    store.activityStore = new ActivityStore();
    store.commonStore = new CommonStore();
    store.userStore = new UserStore();
    store.modalStore = new ModalStore();
    store.profileStore = new ProfileStore();
    store.commentStore = new CommentStore();
}