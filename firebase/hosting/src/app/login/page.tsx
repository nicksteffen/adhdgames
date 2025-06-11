import { Suspense } from "react";
import LoginPage from "./LoginPage";



export default function LoginPageContainer() {



    return (
        <Suspense>
            <LoginPage/>
        </Suspense>
    )
}