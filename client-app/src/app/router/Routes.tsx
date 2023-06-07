import { createBrowserRouter, Navigate, RouteObject } from "react-router-dom";
import ActivityDashboard from "../../features/activities/dashboard/ActivityDashboard";
import ActivityDetails from "../../features/activities/details/ActivityDetails";
import ActivityForm from "../../features/activities/form/ActivityForm";
import NotFound from "../../features/errors/NotFound";
import ServerError from "../../features/errors/ServerError";
import TestErrors from "../../features/errors/TestError";
import ProfilePage from "../../features/profiles/ProfilePage";
import LoginForm from "../../features/users/LoginForm";
import App from "../layout/App";
import RequireAuth from "./RequireAuth";
import ActivityCalendar from "../../features/activities/dashboard/ActivityCalendar";
import RegisterSuccess from "../../features/users/RegisterSuccess";
import ConfirmEmail from "../../features/users/ConfirmEmail";
import SendResetPasswordLinkSuccess from "../../features/users/SendResetPasswordLinkSucces";
import ResetPassword from "../../features/users/ResetPassword";
import ChangePassword from "../../features/users/ChangePassword";

export const routes: RouteObject[] = [
    {
        path: "/",
        element: <App />,
        children: [
            {
                element: <RequireAuth />, children: [
                    { path: "/activities", element: <ActivityDashboard /> },
                    { path: "/activitiesCalendar", element: <ActivityCalendar /> },
                    { path: "/activities/:id", element: <ActivityDetails /> },
                    { path: "createActivity", element: <ActivityForm key='create' /> },
                    { path: "/manage/:id", element: <ActivityForm key='manage' /> },
                    { path: "/profiles/:username", element: <ProfilePage /> },
                    { path: '/account/changePassword', element: <ChangePassword /> },
                    { path: "/errors", element: <TestErrors /> },
                ]
            },
            { path: "/login", element: <LoginForm /> },
            { path: "/not-found", element: <NotFound /> },
            { path: "/server-error", element: <ServerError /> },
            { path: "/account/registerSuccess", element: <RegisterSuccess />},
            { path: "/account/forgotPasswordSuccess", element: <SendResetPasswordLinkSuccess /> },
            { path: "/account/resetPassword", element: <ResetPassword />},
            { path: "/account/verifyEmail", element: <ConfirmEmail /> },
            { path: "*", element: <Navigate replace to="/not-found" /> }
        ]
    }
]

export const router = createBrowserRouter(routes);