import React, { createContext, ReactNode, useState } from 'react';

interface useApiHookContextType {
    store: any;
    setStore: React.Dispatch<React.SetStateAction<any>>;
}
interface UseApiHookContextProps {
    children: ReactNode;
    initialProp?: {
        [key: string]: any;
    };
}

export const UseApiHookContext = createContext<useApiHookContextType | null>(null);
function UseApiHookProvider({
    children,
    initialProp = {}
}: UseApiHookContextProps) {


    const [store, setStore] = useState<any>(initialProp || {});
    return (
        <UseApiHookContext.Provider value={{ store, setStore }}>
            {children}
        </UseApiHookContext.Provider>
    );
}

export default UseApiHookProvider;
