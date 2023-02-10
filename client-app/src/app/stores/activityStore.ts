import { PagingParams } from './../models/pagination';
import { ActivityFormValues } from './../models/activity';
import { makeAutoObservable, reaction, runInAction } from "mobx";
import agent from "../api/agent";
import { Activity } from "../models/activity";
import { store } from "./store";
import { Profile } from "../models/profile";
import { Pagination } from '../models/pagination';


export default class ActivityStore {
    activityRegistry = new Map<string, Activity>();
    selectedActivity: Activity | undefined = undefined;
    editMode = false;
    loading = false;
    loadingInitial = false;
    pagination: Pagination | null = null;
    pagingParams = new PagingParams();
    predicate = new Map().set('all', true);

    constructor() {
        makeAutoObservable(this);

        reaction(
            () => this.predicate.keys(),
            () => {
                this.pagingParams = new PagingParams();
                this.activityRegistry.clear();
                this.loadActivities();
            }
        )
    }

    setPagingParams = (pagingParams: PagingParams) => {
        this.pagingParams = pagingParams;
    }

    setPredicate = (predicate: string, value: string | Date) => {
        const resetPredicate = () => {
            this.predicate.forEach((value, key) => {
                if (key !== 'startDate') {
                    this.predicate.delete(key);
                }
            });
        }
        switch (predicate) {
            case 'all':
                resetPredicate();
                this.predicate.set('all', true);
                break;
            case 'isGoing':
                resetPredicate();
                this.predicate.set('isGoing', true);
                break;
            case 'isHost':
                resetPredicate();
                this.predicate.set('isHost', true);
                break;
            case 'startDate':
                this.predicate.delete('startDate');
                this.predicate.set('startDate', value);
                break;
        }
    }

    get axiosParams() {
        const params = new URLSearchParams();
        params.append('pageNumber', this.pagingParams.pageNumber.toString());
        params.append('pageSize', this.pagingParams.pageSize.toString());
        this.predicate.forEach((value, key) => {
            if (key === 'startDate') {
                params.append(key, value.toISOString());
            } else {
                params.append(key, value);
            }
        });
        return params;
    }

    get activitiesByDate() {
        return Array.from(this.activityRegistry.values()).sort((a, b) =>
            a.date!.getTime() - b.date!.getTime()
        );
    }

    // Create a function that returns an array of arrays of activities grouped by date
    get groupedActivities() {
        return Object.entries(
            this.activitiesByDate.reduce((activities, activity) => {
                // Get the date from the activity object and split it into an array of strings
                const date = activity.date!.toISOString().split('T')[0];
                // If the activities object already has a key for the date, add the activity to the array for that date
                // Otherwise add a new key for the date with a new array containing the activity
                activities[date] = activities[date] ? [...activities[date], activity] : [activity];
                return activities;
            }, {} as { [key: string]: Activity[] })
        )
    }

    loadActivities = async () => {
        this.setLoadingInitial(true);
        try {
            const result = await agent.Activities.list(this.axiosParams);
            result.data.forEach(activity => {
                this.setActivity(activity);
            })
            this.setPagination(result.pagination);
            this.setLoadingInitial(false);
        } catch (error) {
            console.log(error);
            this.setLoadingInitial(false);
        }
    }

    setPagination = (pagination: Pagination) => {
        this.pagination = pagination;
    }

    loadActivity = async (id: string) => {
        // Check if the activity is already in the store
        let activity = this.getActivity(id);
        // If so, set it as selected and return it
        if (activity) {
            this.selectedActivity = activity;
            return activity;
        } else {
            // If not, set loading to true, fetch the activity from the API and add it to the store
            this.loadingInitial = true;
            try {
                activity = await agent.Activities.details(id);
                this.setActivity(activity);
                runInAction(() => {
                    this.selectedActivity = activity;
                })
                this.setLoadingInitial(false);
                return activity;
            } catch (error) {
                console.log(error);
                this.setLoadingInitial(false);
            }
        }
    }

    private setActivity = (activity: Activity) => {
        // Get the current user
        const user = store.userStore.user;
        // If the user exists
        if (user) {
            // Check if the current user is going to the activity
            activity.isGoing = activity.attendees!.some(a => a.username === user.username);
            // Check if the current user is the host of the activity
            activity.isHost = activity.hostUsername === user.username;
            // Get the host of the activity
            activity.host = activity.attendees?.find(x => x.username === activity.hostUsername);
        }
        // Set the date of the activity
        activity.date = new Date(activity.date!);
        // Add the activity to the activity registry
        this.activityRegistry.set(activity.id, activity);
    }

    private getActivity = (id: string) => {
        return this.activityRegistry.get(id);
    }

    setLoadingInitial = (state: boolean) => {
        this.loadingInitial = state;
    }

    createActivity = async (activity: ActivityFormValues) => {
        const user = store.userStore.user;
        const attendee = new Profile(user!);
        try {
            await agent.Activities.create(activity);
            const newActivity = new Activity(activity);
            newActivity.hostUsername = user!.username;
            newActivity.attendees = [attendee];
            this.setActivity(newActivity);
            runInAction(() => {
                this.selectedActivity = newActivity;
            })
        } catch (error) {
            console.log(error);
        }
    }

    updateActivity = async (activity: ActivityFormValues) => {
        try {
            await agent.Activities.update(activity);
            runInAction(() => {
                if (activity.id) {
                    let updatedActivity = { ...this.getActivity(activity.id), ...activity };
                    this.activityRegistry.set(activity.id, updatedActivity as Activity);
                    this.selectedActivity = updatedActivity as Activity;
                }
            })
        } catch (error) {
            console.log(error);
        }
    }

    deleteActivity = async (id: string) => {
        this.loading = true;
        try {
            await agent.Activities.delete(id);
            runInAction(() => {
                this.activityRegistry.delete(id);
                this.loading = false;
            })
        } catch (error) {
            console.log(error);
            runInAction(() => {
                this.loading = false;
            })
        }
    }

    updateAttendee = async () => {
        const user = store.userStore.user; // Get the current user from the userStore
        this.loading = true; // Set loading to true to indicate that the activity is being updated
        try {
            await agent.Activities.attend(this.selectedActivity!.id); // Make the API call to the server to attend or unattend the activity
            runInAction(() => {
                if (this.selectedActivity?.isGoing) { // Check if the activity is already being attended
                    this.selectedActivity.attendees = this.selectedActivity.attendees?.filter(a => a.username !== user?.username); // Remove the user from the list of attendees
                    this.selectedActivity.isGoing = false; // Set the isGoing property to false
                } else {
                    const attendee = new Profile(user!); // Create a new profile for the user
                    this.selectedActivity?.attendees?.push(attendee); // Add the user to the list of attendees
                    this.selectedActivity!.isGoing = true; // Set the isGoing property to true
                }
                this.activityRegistry.set(this.selectedActivity!.id, this.selectedActivity!); // Update the activity in the activity registry
                this.loading = false; // Set loading to false to indicate that the activity has finished updating
            })
        } catch (error) {
            console.log(error);
        } finally {
            runInAction(() => {
                this.loading = false; // Set loading to false to indicate that the activity has finished updating
            })
        }
    }

    cancelActivityToggle = async () => {
        this.loading = true; // Set loading to true to indicate that the activity is being updated
        try {
            await agent.Activities.attend(this.selectedActivity!.id); // Make the API call to the server to attend or unattend the activity
            runInAction(() => {
                this.selectedActivity!.isCancelled = !this.selectedActivity!.isCancelled; // Toggle the isCancelled property
                this.activityRegistry.set(this.selectedActivity!.id, this.selectedActivity!); // Update the activity in the activity registry
                this.loading = false; // Set loading to false to indicate that the activity has finished updating
            })
        } catch (error) {
            console.log(error);
        } finally {
            runInAction(() => {
                this.loading = false; // Set loading to false to indicate that the activity has finished updating
            })
        }
    }

    clearSelectedActivity = () => {
        this.selectedActivity = undefined;
    }

    updateAttendeeFollowing = (username: string) => {
        this.activityRegistry.forEach(activity => {
            activity.attendees?.forEach(attendee => {
                if (attendee.username === username) {
                    attendee.following ? attendee.followersCount-- : attendee.followersCount++;
                    attendee.following = !attendee.following;
                }
            })
        })
    }
}