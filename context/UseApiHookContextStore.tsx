import React, { createContext, ReactNode, useState } from 'react';

interface useApiHookContextType {
    store: any;
    setStore: React.Dispatch<React.SetStateAction<any>>;
}
interface UseApiHookContextProps {
    children: ReactNode;
    initialProp: {
        [key: string]: any;
    };
}

export const useApiHookContext = createContext<useApiHookContextType | null>(null);
function UseApiHookContextStore({
    children,
    initialProp = {}
}: UseApiHookContextProps) {


    const [store, setStore] = useState<any>(initialProp || {});
    return (
        <useApiHookContext.Provider value={{ store, setStore }}>
            {children}
        </useApiHookContext.Provider>
    );
}

export default UseApiHookContextStore;
