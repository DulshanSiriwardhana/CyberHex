import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuthModal } from "@/stores/authModal";
import SignIn from "@/components/signin";
import SignUp from "@/components/signup/signup";

export default function AuthModals() {
    const { signInOpen, signUpOpen, closeAll, openSignIn, openSignUp } = useAuthModal();

    return (
        <>
            <Dialog open={signInOpen} onOpenChange={(open) => !open && closeAll()}>
                <SignIn onSuccess={closeAll} />
            </Dialog>

            <Dialog open={signUpOpen} onOpenChange={(open) => !open && closeAll()}>
                <DialogContent className="sm:max-w-md">
                    <SignUp />
                    <div className="mt-4 text-center">
                        <p className="text-sm text-neutral-500">
                            Already have an account?{" "}
                            <button
                                onClick={openSignIn}
                                className="font-medium text-green-400 hover:text-green-300 transition-colors"
                            >
                                Sign in
                            </button>
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
