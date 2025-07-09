import { createContext, useContext, useEffect, useState } from "react";
import {auth} from '../firebase';
import {onAuthStateChanged,signOut,signInWithEmailAndPassword,createUserWithEmailAndPassword} from 'firebase/auth'






const AuthContext = createContext();

export const AuthProvider = ({children}) =>{
    const [user,setUser] = useState(null);

    useEffect(()=>{
        const unsubscribe = onAuthStateChanged(auth,(currentUser)=>{
            setUser(currentUser);
        });
        return () => unsubscribe();
    },[])
    const signup = (email,password) =>createUserWithEmailAndPassword(auth,email,password);
    const login = (email,password) =>signInWithEmailAndPassword(auth,email,password);
    const logout = () => signOut(auth);

    return (
        <AuthContext.Provider value={{user,signup,login,logout}}>
            {children}
        </AuthContext.Provider>
    )
};

export const useAuth = () =>useContext(AuthContext);