import { Suspense } from "react";
import SignupPage from "./SignupPage";


export default function SignupPageContainer() {
    return (
        <Suspense>
            <SignupPage/>
        </Suspense>
    )
}